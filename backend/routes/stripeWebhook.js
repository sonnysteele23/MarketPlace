/**
 * Stripe webhook handler.
 *
 * Mounted in server.js with express.raw() before express.json() because
 * Stripe signature verification needs the raw body.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *
 * Subscribe these events in your Stripe Connect application webhook config:
 *   - account.updated
 *   - account.application.deauthorized
 *   - payout.paid (optional, for confirmation logging)
 *   - payout.failed (optional, for alerting)
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabaseAdmin } = require('../config/supabase');

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.warn('[stripe-webhook] signature verification failed:', err.message);
        return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'account.updated': {
                const account = event.data.object;
                await supabaseAdmin
                    .from('artists')
                    .update({
                        stripe_charges_enabled: !!account.charges_enabled,
                        stripe_payouts_enabled: !!account.payouts_enabled,
                        stripe_details_submitted: !!account.details_submitted,
                    })
                    .eq('stripe_account_id', account.id);
                break;
            }

            case 'account.application.deauthorized': {
                const account = event.data.object;
                await supabaseAdmin
                    .from('artists')
                    .update({
                        stripe_account_id: null,
                        stripe_charges_enabled: false,
                        stripe_payouts_enabled: false,
                        stripe_details_submitted: false,
                    })
                    .eq('stripe_account_id', account.id);
                break;
            }

            case 'payout.paid':
            case 'payout.failed':
                console.log(`[stripe-webhook] ${event.type}`, event.data.object.id, event.account);
                break;

            default:
                // Unhandled — fine, just log at debug level
                break;
        }

        res.json({ received: true });
    } catch (err) {
        console.error('[stripe-webhook] handler error:', err);
        // 200 anyway: we'd rather not have Stripe retry a hundred times if our DB is wedged
        res.json({ received: true, warning: err.message });
    }
});

module.exports = router;
