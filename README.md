This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Inter (used as a fallback after the system SF Pro font).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your WooCommerce REST API credentials
(WordPress admin: WooCommerce > Settings > Advanced > REST API).

- `NEXT_PUBLIC_WP_URL` - the WooCommerce backend URL, e.g. `https://api.ecbtechkenya.com`
- `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` - server-only API keys, never exposed to the browser

## Deployment (Vercel)

The store is hosted on Vercel and connected to this GitHub repository. Every
push to `main` deploys to production at https://ecb-technologies-five.vercel.app.
Vercel reports each deployment's result on the commit in GitHub.

The domain www.ecbtechkenya.com does not point here yet; it still serves the
previous website. See `docs/seo/REGISTER.md` §0 for the switch-over plan.
Cloudflare manages the domain's DNS.

- Set `NEXT_PUBLIC_WP_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`,
  `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in the Vercel
  project settings. `NEXT_PUBLIC_*` values are inlined at build time.
- Product images are served from the WooCommerce host, which is
  allow-listed in `next.config.ts` under `images.remotePatterns`. If the
  media host changes, update that list.
- Do not host this on GitHub Pages: checkout, payment verification and
  live catalogue data need a server.
