/**
 * Artist Earnings Page
 * Wires Stripe Connect status, balance, payouts, and onboarding/dashboard links.
 */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://marketplace-production-57b7.up.railway.app/api';

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'artist') {
        window.location.href = '../frontend/login.html?redirect=artist-cms/earnings.html';
        return null;
    }

    const artistNameEl = document.getElementById('artist-name');
    if (artistNameEl && user.business_name) {
        artistNameEl.textContent = user.business_name;
    }
    return { token, user };
}

function authHeaders(token) {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function fmtCurrencyCents(cents, currency) {
    const amount = (cents || 0) / 100;
    return amount.toLocaleString('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() });
}

function sumBalance(rows) {
    return (rows || []).reduce((sum, row) => sum + (row.amount || 0), 0);
}

// ─────────────────────────────────────────────
// Connect status banner
// ─────────────────────────────────────────────

const BANNER_STATES = {
    not_connected: {
        bg: '#FEF3C7', border: '#FCD34D', icon: '#92400E', titleColor: '#78350F',
        title: 'Connect Stripe to receive payouts',
        body: 'Stripe handles your bank verification, payouts, and tax forms. Setup takes about 5 minutes.',
        ctaLabel: 'Connect Stripe',
        showCta: true,
    },
    incomplete: {
        bg: '#FEF3C7', border: '#FCD34D', icon: '#92400E', titleColor: '#78350F',
        title: 'Finish setting up your Stripe account',
        body: 'Stripe needs a few more details before you can accept payments.',
        ctaLabel: 'Continue Setup',
        showCta: true,
    },
    needs_action: {
        bg: '#FEE2E2', border: '#FCA5A5', icon: '#991B1B', titleColor: '#7F1D1D',
        title: 'Action required on your Stripe account',
        body: 'Stripe needs additional information to keep your account active.',
        ctaLabel: 'Resolve in Stripe',
        showCta: true,
    },
    connected: {
        bg: '#ECFDF5', border: '#A7F3D0', icon: '#065F46', titleColor: '#064E3B',
        title: 'Connected to Stripe — payouts active',
        body: 'Customers can now buy your work and Stripe will pay out automatically.',
        ctaLabel: 'Manage on Stripe',
        showCta: false,
    },
};

function applyBannerState(stateKey) {
    const banner = document.getElementById('stripe-connect-banner');
    const iconWrap = document.getElementById('stripe-connect-icon');
    const title = document.getElementById('stripe-connect-title');
    const body = document.getElementById('stripe-connect-body');
    const cta = document.getElementById('stripe-connect-cta');
    const ctaLabel = document.getElementById('stripe-connect-cta-label');
    const cfg = BANNER_STATES[stateKey];
    if (!cfg) return;
    banner.style.display = 'flex';
    banner.style.background = cfg.bg;
    banner.style.border = `1px solid ${cfg.border}`;
    iconWrap.style.background = cfg.bg;
    iconWrap.style.color = cfg.icon;
    title.style.color = cfg.titleColor;
    title.textContent = cfg.title;
    body.textContent = cfg.body;
    cta.style.display = cfg.showCta ? 'inline-flex' : 'none';
    if (ctaLabel) ctaLabel.textContent = cfg.ctaLabel;
    cta.dataset.action = stateKey === 'not_connected' ? 'onboard' : 'continue';
}

async function loadConnectStatus(token) {
    const res = await fetch(`${API_BASE_URL}/artists/me/stripe/connect/status`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        applyBannerState('not_connected');
        return null;
    }
    const status = await res.json();
    if (!status.connected) {
        applyBannerState('not_connected');
    } else if (!status.details_submitted || !status.charges_enabled) {
        const requirements = status.requirements || {};
        const hasOverdue = requirements.currently_due && requirements.currently_due.length > 0;
        applyBannerState(hasOverdue ? 'needs_action' : 'incomplete');
    } else {
        applyBannerState('connected');
        // Switch the header button on
        const headerBtn = document.getElementById('stripe-action-btn');
        if (headerBtn) headerBtn.hidden = false;
    }
    return status;
}

async function handleConnectCta(token) {
    const cta = document.getElementById('stripe-connect-cta');
    if (!cta) return;
    cta.addEventListener('click', async () => {
        cta.disabled = true;
        const originalLabel = cta.querySelector('span').textContent;
        cta.querySelector('span').textContent = 'Opening Stripe…';
        try {
            const res = await fetch(`${API_BASE_URL}/artists/me/stripe/connect/onboard`, {
                method: 'POST',
                headers: authHeaders(token),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Could not start onboarding');
            const data = await res.json();
            window.location.href = data.url;
        } catch (err) {
            alert(err.message);
            cta.querySelector('span').textContent = originalLabel;
            cta.disabled = false;
        }
    });
}

async function handleManageButton(token) {
    const btn = document.getElementById('stripe-action-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/artists/me/stripe/connect/login-link`, {
                method: 'POST',
                headers: authHeaders(token),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Could not open Stripe dashboard');
            const data = await res.json();
            window.open(data.url, '_blank', 'noopener,noreferrer');
        } catch (err) {
            alert(err.message);
        } finally {
            btn.disabled = false;
        }
    });
}

// ─────────────────────────────────────────────
// Balance + payouts
// ─────────────────────────────────────────────

async function loadBalance(token) {
    const res = await fetch(`${API_BASE_URL}/artists/me/stripe/balance`, {
        headers: authHeaders(token),
    });
    if (!res.ok) return;
    const { connected, available, pending } = await res.json();
    if (!connected) return;

    const availableCents = sumBalance(available);
    const pendingCents = sumBalance(pending);
    const currency = (available && available[0] && available[0].currency)
        || (pending && pending[0] && pending[0].currency) || 'usd';

    document.getElementById('available-balance').textContent = fmtCurrencyCents(availableCents, currency);
    document.getElementById('pending-earnings').textContent = fmtCurrencyCents(pendingCents, currency);
}

function payoutRowHtml(p) {
    const date = new Date(p.arrival_date * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const statusClass = p.status === 'paid' ? 'completed' : (p.status === 'failed' ? 'failed' : 'pending');
    const description = p.description || `Payout via ${p.method}`;
    return `
      <div class="payout-item">
        <div class="payout-info">
          <div class="payout-icon"><i data-lucide="banknote"></i></div>
          <div class="payout-details">
            <strong>${description}</strong>
            <span>${date}</span>
          </div>
        </div>
        <div class="payout-amount ${p.status === 'paid' ? 'success' : ''}">
          ${p.status === 'paid' ? '+' : ''}${fmtCurrencyCents(p.amount, p.currency)}
        </div>
        <span class="payout-status ${statusClass}">${p.status}</span>
      </div>`;
}

async function loadPayouts(token) {
    const res = await fetch(`${API_BASE_URL}/artists/me/stripe/payouts?limit=10`, {
        headers: authHeaders(token),
    });
    if (!res.ok) return;
    const { connected, payouts } = await res.json();
    if (!connected || !payouts || payouts.length === 0) return;

    const list = document.getElementById('payout-list');
    if (!list) return;
    list.innerHTML = payouts.map(payoutRowHtml).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Total paid
    const totalPaid = payouts
        .filter(p => p.status === 'paid')
        .reduce((s, p) => s + (p.amount || 0), 0);
    const totalEl = document.getElementById('total-paid');
    if (totalEl) totalEl.textContent = fmtCurrencyCents(totalPaid, payouts[0].currency);
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────

async function init() {
    const auth = checkAuth();
    if (!auth) return;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    handleConnectCta(auth.token);
    handleManageButton(auth.token);

    const status = await loadConnectStatus(auth.token);
    if (status && status.connected && status.charges_enabled) {
        await Promise.all([loadBalance(auth.token), loadPayouts(auth.token)]);
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            window.location.href = '../frontend/login.html';
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
