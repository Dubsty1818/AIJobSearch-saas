import Stripe from 'stripe';
import 'server-only';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  typescript: true,
});
