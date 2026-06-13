// =================================================================
// CHECKOUT URL PLACEHOLDERS
// =================================================================
// These are *not* real Stripe checkout sessions. They are placeholder
// links surfaced from the Upgrade prompt. Replace each value with a
// real Stripe Checkout URL (or wire a server fn that creates a session
// on demand) once the billing provider is connected.
//
// Do NOT store provider secret keys here — they belong in server env
// only and must never reach the client bundle.
// =================================================================

export const CHECKOUT_LINKS: Record<string, { url: string; isPlaceholder: true }> = {
  pro:        { url: "mailto:billing@remotedesk.example?subject=Upgrade%20to%20Pro",        isPlaceholder: true },
  business:   { url: "mailto:billing@remotedesk.example?subject=Upgrade%20to%20Business",   isPlaceholder: true },
  enterprise: { url: "mailto:sales@remotedesk.example?subject=Enterprise%20inquiry",        isPlaceholder: true },
};

export const CUSTOMER_PORTAL_URL: { url: string | null; isPlaceholder: true } = {
  url: null,
  isPlaceholder: true,
};
