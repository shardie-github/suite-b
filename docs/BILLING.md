# Billing (Scaffold)
- Enable via `BILLING_ENABLED=true`. Stripe webhook is available at `/webhook`.
- Recommended connect usage metric `report.query` to your pricing ladder.
- For production verify webhook signatures and store Stripe IDs securely.
