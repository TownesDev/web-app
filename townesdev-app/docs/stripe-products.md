# Stripe Product & Price Catalog

> Populate this document with the live IDs after creating the products and prices in the Stripe Dashboard (test mode for now). Keep the naming exactly as defined below so the engineering and ops teams can reference a single source of truth.

## Small Business

| Offer        | Stripe Product Name                       | Product ID            | Setup Fee Price ID                                 | Setup Fee Lookup Key     | Monthly Price ID                           | Monthly Lookup Key         | Amounts                     |
| ------------ | ----------------------------------------- | --------------------- | -------------------------------------------------- | ------------------------ | ------------------------------------------ | -------------------------- | --------------------------- |
| Starter      | TownesDev - Small Business - Starter      | `prod_TNdOQZhlO6tql0` | `price_1SQs88J9pYilSUOizwawfyUe` ($1,200 one-time) | `business_starter_setup` | `price_1SQs88J9pYilSUOicpAe1C1R` ($99/mo)  | `business_starter_monthly` | $1,200 setup / $99 monthly  |
| Professional | TownesDev - Small Business - Professional | `prod_TNdVIhZDaI5zJV` | `price_1SQsENJ9pYilSUOi1CCsS4Yi` ($2,500 one-time) | `business_pro_setup`     | `price_1SQsENJ9pYilSUOieKSLePia` ($199/mo) | `business_pro_monthly`     | $2,500 setup / $199 monthly |
| Premium      | TownesDev - Small Business - Premium      | `prod_TNdaTmf3AqNQVX` | `price_1SQsJVJ9pYilSUOiqv8MpRGW` ($5,000 one-time) | `business_premium_setup` | `price_1SQsJVJ9pYilSUOilXUAKS0O` ($399/mo) | `business_premium_monthly` | $5,000 setup / $399 monthly |

**Stripe Descriptions (copy into the Product/Price description fields):**

| Offer        | Product Description                                                                                                     | Setup Fee Price Description                                                 | Monthly Price Description                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Starter      | "Rapid launch website package for small teams, includes 1-3 page build, mobile optimization, and contact integrations." | "One-time design and implementation of the Starter website experience."     | "Managed hosting, content updates, and monitoring for Starter sites (billed monthly)." |
| Professional | "Full CMS-powered website build for growing businesses with custom design, SEO, and analytics."                         | "One-time Professional site build, CMS setup, and training."                | "Ongoing hosting, weekly updates, and priority support for Professional plan."         |
| Premium      | "Enterprise-grade web presence with e-commerce, booking flows, and advanced support SLAs."                              | "Premium implementation: strategy, custom development, and launch support." | "Daily monitoring, 4-hour SLA, and feature enhancements for Premium plan."             |

## Discord Bots

| Offer      | Stripe Product Name                  | Product ID            | Monthly Price ID                           | Monthly Lookup Key           | Amount       |
| ---------- | ------------------------------------ | --------------------- | ------------------------------------------ | ---------------------------- | ------------ |
| Community  | TownesDev - Discord Bot - Community  | `prod_TNe8PmUzrkMicC` | `price_1SQsplJ9pYilSUOiUmjvcnCU` ($49/mo)  | `discord_community_monthly`  | $49 monthly  |
| Guild      | TownesDev - Discord Bot - Guild      | `prod_TNe8yNqN541sKD` | `price_1SQsq7J9pYilSUOi1Yplylsh` ($99/mo)  | `discord_guild_monthly`      | $99 monthly  |
| Enterprise | TownesDev - Discord Bot - Enterprise | `prod_TNeCqRk9N5U0F0` | `price_1SQsuTJ9pYilSUOirnThRJfr` ($299/mo) | `discord_enterprise_monthly` | $299 monthly |

**Stripe Descriptions:**

| Offer      | Product Description                                                                                      | Monthly Price Description                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Community  | "Managed Discord bot with welcome flows, moderation tools, and basic automations for community servers." | "Hosting, updates, and community support for the Community bot plan."                      |
| Guild      | "Advanced Discord automations with multi-server support, role workflows, and email ticketing."           | "Priority hosting, feature updates, and 48-hour response support for the Guild plan."      |
| Enterprise | "Custom Discord bot program with bespoke features, unlimited servers, and dedicated success channel."    | "Enterprise-level support with rapid response, roadmap planning, and managed deployments." |

## Musicians

| Offer            | Stripe Product Name                     | Product ID            | Setup Fee Price ID                                 | Setup Fee Lookup Key  | Monthly Price ID                           | Monthly Lookup Key      | Amounts                     |
| ---------------- | --------------------------------------- | --------------------- | -------------------------------------------------- | --------------------- | ------------------------------------------ | ----------------------- | --------------------------- |
| Solo Artist      | TownesDev - Musician - Solo Artist      | `prod_TNeE8TpPZk5EYB` | `price_1SQswDJ9pYilSUOiLSKZPOEK` ($500 one-time)   | `music_starter_setup` | `price_1SQswDJ9pYilSUOi0jY6rwMb` ($29/mo)  | `music_starter_monthly` | $500 setup / $29 monthly    |
| Band/Pro         | TownesDev - Musician - Band/Pro         | `prod_TNeI9oDaopmTNk` | `price_1SQszTJ9pYilSUOi07iHSJAB` ($1,200 one-time) | `music_pro_setup`     | `price_1SQszTJ9pYilSUOizwFkIOgN` ($79/mo)  | `music_pro_monthly`     | $1,200 setup / $79 monthly  |
| Label/Management | TownesDev - Musician - Label/Management | `prod_TNeK5K7JNB4szv` | `price_1SQt1dJ9pYilSUOizL7v9P4C` ($2,500 one-time) | `music_label_setup`   | `price_1SQt1dJ9pYilSUOi9ZHOqsbt` ($199/mo) | `music_label_monthly`   | $2,500 setup / $199 monthly |

**Stripe Descriptions:**

| Offer            | Product Description                                                                          | Setup Fee Price Description                                                    | Monthly Price Description                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Solo Artist      | "Single-page artist site with streaming embeds, show dates, and booking contact form."       | "Design and launch of Solo Artist site with content onboarding."               | "Hosting, content refreshes, and show updates for Solo Artist plan."                       |
| Band/Pro         | "Multi-page band website with merch support, mailing list capture, and press kit."           | "Custom build of Band/Pro site including merch and mailing list integrations." | "Managed hosting, merch updates, and tour support for Band/Pro plan."                      |
| Label/Management | "Multi-artist platform with booking management, analytics dashboard, and concierge support." | "White-glove rollout of Label/Management portal with multi-artist setup."      | "Dedicated account management, analytics, and priority updates for Label/Management plan." |

### Update Checklist

- [ ] Stripe account verified (test mode)
- [ ] All nine products created with the exact naming listed above
- [ ] One-time setup fees created as separate prices where required
- [ ] Monthly subscription prices created with recurring billing intervals set to `Monthly`
- [ ] IDs copied into this document and into `.env.local`
- [ ] `.env.local` staged/committed only if policy allows (otherwise store securely)

Once values are filled in, sync the environment variables in `.env.local` with the placeholders shown in `.env.example`.
