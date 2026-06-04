# Stripe Dashboard Checkout Branding Checklist

Use this for the account-side Stripe settings that cannot be reliably changed from the app code.

## Fix "Pay felmonon"

Stripe Checkout uses the Stripe account public business name at the top of the hosted payment page.

Set:

- Public business name: `TypeJung`
- Statement descriptor: `TYPEJUNG`
- Support email: the TypeJung support inbox
- Support URL: `https://typejung.com`

## Branding

Upload:

- Icon: TypeJung green icon
- Logo: TypeJung energy-map mark from `public/logo.png`
- Brand color: `#2d5a3d`
- Accent color: `#2d5a3d`

## Link Saved Checkout

If you do not want the "Confirm it's you" Link prompt:

- Disable Link in Stripe payment method settings, or
- Keep Link enabled and let customers choose "Pay without Link" on the Stripe page.

The app already tells users they can choose Pay without Link if they prefer manual card entry.

## Promotion Code

The app sends `allow_promotion_codes=true`, so Stripe Checkout will show the promotion-code field. Create the launch coupon in Stripe:

- Code: `DEPTH20`
- Discount: 20% off
- Duration: once
- Active window: launch week only
