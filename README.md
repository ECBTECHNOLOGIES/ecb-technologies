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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Inter and Poppins.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your WooCommerce REST API credentials
(WordPress admin: WooCommerce > Settings > Advanced > REST API).

- `NEXT_PUBLIC_WP_URL` - the WooCommerce site URL, e.g. `https://www.ecbtechkenya.com`
- `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` - server-only API keys, never exposed to the browser

## Deployment (Cloudflare)

The site is hosted on Cloudflare, connected to this GitHub repository.
Every push to `main` deploys to production at https://www.ecbtechkenya.com.

- Cloudflare does not post build statuses back to GitHub, so check the
  build result in the Cloudflare dashboard (Workers & Pages → the project
  → Deployments), or confirm the change on the live site.
- Set the environment variables listed above (`NEXT_PUBLIC_WP_URL`,
  `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) in the Cloudflare project
  settings. `NEXT_PUBLIC_WP_URL` is inlined at build time, so it must be
  available to the build as well as at runtime.
- Product images are served from the WooCommerce host, which is
  allow-listed in `next.config.ts` under `images.remotePatterns`. If the
  media host changes, update that list.
