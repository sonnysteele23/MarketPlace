/**
 * Stripe Connect (Express) routes
 * Onboarding, status, balance, payouts, dashboard login link.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY      - sk_test_... or sk_live_...
 *   STRIPE_WEBHOOK_SECRET  - whsec_... (for /api/webhooks/stripe; mounted in server.js)
 *   FRONTEND_URL           - e.g. https://amyshaven.com (used for onboarding refresh/return)
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://amyshaven.com';

// Helper: load full artist row (auth middleware only loads the basics)
async function loadArtistFull(artistId) {
    const { data, error } = await supabaseAdmin
        .from('artists')
        .select('id, email, business_name, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted')
        .eq('id', artistId)
        .single();
    if (error) throw error;
    return data;
}

// POST /api/artists/me/stripe/connect/onboard
// Creates an Express account if none exists, returns a one-time AccountLink URL.
router.post('/connect/onboard', authenticateToken, async (req, res) => {
    try {
        let artist = await loadArtistFull(req.artist.id);

        let accountId = artist.stripe_account_id;

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: artist.email,
                business_type: 'individual',
                business_profile: {
                    name: artist.business_name,
                    product_description: 'Handmade goods sold via Amy\'s Haven',
                    mcc: '5970', // Artist supply / craft shops
                },
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: { amyshaven_artist_id: artist.id },
            });
            accountId = account.id;

            const { error: updateErr } = await supabaseAdmin
                .from('artists')
                .update({ stripe_account_id: accountId })
                .eq('id', artist.id);
            if (updateErr) throw updateErr;
        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${FRONTEND_URL}/artist-cms/earnings.html?stripe=refresh`,
            return_url: `${FRONTEND_URL}/artist-cms/earnings.html?stripe=return`,
            type: 'account_onboarding',
        });

        res.json({ url: accountLink.url, account_id: accountId });
    } catch (err) {
        console.error('[stripe-connect/onboard]', err);
        res.status(500).json({ error: 'Could not start Stripe onboarding', details: err.message });
    }
});

// GET /api/artists/me/stripe/connect/status
// Returns the live capability state from Stripe (and updates our DB row).
router.get('/connect/status', authenticateToken, async (req, res) => {
    try {
        const artist = await loadArtistFull(req.artist.id);
        if (!artist.stripe_account_id) {
            return res.json({
                connected: false,
                charges_enabled: false,
                payouts_enabled: false,
                details_submitted: false,
                requirements: null,
            });
        }

        const account = await stripe.accounts.retrieve(artist.stripe_account_id);
        const status = {
            connected: true,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            requirements: account.requirements || null,
        };

        // Cache state on artist row
        await supabaseAdmin
            .from('artists')
            .update({
                stripe_charges_enabled: account.charges_enabled,
                stripe_payouts_enabled: account.payouts_enabled,
                stripe_details_submitted: account.details_submitted,
            })
            .eq('id', artist.id);

        res.json(status);
    } catch (err) {
        console.error('[stripe-connect/status]', err);
        res.status(500).json({ error: 'Could not fetch Stripe status', details: err.message });
    }
});

// POST /api/artists/me/stripe/connect/login-link
// Returns a fresh URL the artist can use to open their Express dashboard.
router.post('/connect/login-link', authenticateToken, async (req, res) => {
    try {
        const artist = await loadArtistFull(req.artist.id);
        if (!artist.stripe_account_id) {
            return res.status(400).json({ error: 'Stripe account not connected' });
        }
        const link = await stripe.accounts.createLoginLink(artist.stripe_account_id);
        res.json({ url: link.url });
    } catch (err) {
        console.error('[stripe-connect/login-link]', err);
        res.status(500).json({ error: 'Could not create dashboard link', details: err.message });
    }
});

// GET /api/artists/me/stripe/balance
// Live Stripe balance (available + pending) for this artist's connected account.
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const artist = await loadArtistFull(req.artist.id);
        if (!artist.stripe_account_id) {
            return res.json({ connected: false, available: [], pending: [] });
        }
        const balance = await stripe.balance.retrieve({ stripeAccount: artist.stripe_account_id });
        res.json({
            connected: true,
            available: balance.available || [],
            pending: balance.pending || [],
        });
    } catch (err) {
        console.error('[stripe-connect/balance]', err);
        res.status(500).json({ error: 'Could not fetch balance', details: err.message });
    }
});

// GET /api/artists/me/stripe/payouts
// Recent payouts for this artist's connected account.
router.get('/payouts', authenticateToken, async (req, res) => {
    try {
        const artist = await loadArtistFull(req.artist.id);
        if (!artist.stripe_account_id) {
            return res.json({ connected: false, payouts: [] });
        }
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const payouts = await stripe.payouts.list(
            { limit },
            { stripeAccount: artist.stripe_account_id }
        );
        res.json({
            connected: true,
            payouts: payouts.data.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                arrival_date: p.arrival_date,
                method: p.method,
                description: p.description,
            })),
        });
    } catch (err) {
        console.error('[stripe-connect/payouts]', err);
        res.status(500).json({ error: 'Could not fetch payouts', details: err.message });
    }
});

module.exports = router;
