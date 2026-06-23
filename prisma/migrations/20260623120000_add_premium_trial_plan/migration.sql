-- Add PREMIUM_TRIAL value to SubscriptionPlan enum for the 7-day trial plan.
-- Required because CareerForge AI now sells a ₹249 / 7-day trial plan alongside
-- the monthly (₹349) and yearly (₹1,499) plans.

ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'PREMIUM_TRIAL';
