# BrokerForge — Launch your brokerage in weeks

**BrokerForge** is a clean-room broker white-label website: MT5-type white label,
trading platforms, forex CRM, liquidity, payments & KYC, turnkey brokerage and
prop-trading solutions — all freshly written, with a new brand, new design and
new copy. It is inspired by the structure of a reference white-label site, but
no code, text, image, logo or branding was copied from it.

- **Live:** deployed on Vercel / GitHub Pages (see repo deployment)
- **Contact:** +971 52 322 2946 — [WhatsApp](https://wa.me/971523222946)
- **Stack:** static HTML/CSS/JS only. No framework, no backend, no build step.
  Shared `assets/css/style.css` + `assets/js/main.js` on every page.
- **Pages (16):** Home, Solutions, White Label, Platforms, CRM, Liquidity,
  Payments, Pricing, Turnkey, Prop Trading, About, Blog, Contact, FAQ,
  Privacy, Terms — plus `sitemap.xml` and `robots.txt`.
- **Brand:** logo in `assets/logo/` — `logo.svg` (dark lockup), `logo-light.svg`
  (light lockup), `logo-mark.svg`, `favicon.svg`, `logo-512.webp`.
  Palette: deep navy `#081226`, teal `#00D1B2`, gold `#F5B544`.
- **Images:** AI-generated, in `assets/img/` — Dubai trading office, platform
  dashboard, support team, Dubai skyline.
- **Forms:** contact/quote forms validate client-side and show a success state;
  they send/store nothing (no backend). Real replies go via phone/WhatsApp.
- **Disclaimer:** BrokerForge is a technology provider only. It does not offer
  brokerage or investment services and does not hold client funds.

## Local preview

```sh
python3 -m http.server --directory .
# open http://localhost:8000/
```

## Deploy

Push to `main` — Vercel (git-connected) serves the static site. No env vars needed.
