This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required

- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Your Sanity dataset (usually "production")
- `SANITY_READ_TOKEN` - Sanity read token for server-side queries
- `SANITY_AUTH_TOKEN` - Sanity auth token for mutations
- `NEXT_PUBLIC_SANITY_API_VERSION` - Sanity API version (e.g., "2024-01-01")

### Stripe Configuration (for payments)

- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` for sandbox)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_test_` for sandbox)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret for verifying webhook signatures

### Email Configuration

- `NEXT_PUBLIC_RESEND_API_KEY` - Resend API key for sending emails
- `RESEND_API_KEY` - Server-side Resend API key

### URLs

- `NEXT_PUBLIC_BASE_URL` - Your application's base URL (e.g., `http://localhost:3000` for development)

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
