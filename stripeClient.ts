import Stripe from 'stripe';
import { getStripeSecretKey as readStripeSecretKey } from './server/checkout';

export async function getUncachableStripeClient() {
  const secretKey = readStripeSecretKey();
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not found in environment');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

export function getStripePublishableKey() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY not found in environment');
  }
  
  return publishableKey;
}

export function getStripeSecretKey() {
  const secretKey = readStripeSecretKey();
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not found in environment');
  }
  
  return secretKey;
}
