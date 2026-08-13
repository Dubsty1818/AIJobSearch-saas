import { stripe } from '@/lib/stripe';
import { createSupabaseAdminClient } from '@/supabase-clients/admin';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          console.error('No user ID in session metadata');
          break;
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            monthly_quota: 500,
            quota_reset_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating profile on checkout:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get the subscription to find user metadata
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error('No user ID in subscription metadata');
          break;
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'active',
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating profile on payment:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          // Try to find user by stripe_subscription_id
          const { data } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (data) {
            await supabase
              .from('user_profiles')
              .update({
                subscription_status: 'canceled',
                stripe_subscription_id: null,
              })
              .eq('id', data.id);
          }
          break;
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating profile on cancellation:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) break;

        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : subscription.status === 'canceled' ? 'canceled'
          : 'inactive';

        const { error } = await supabase
          .from('user_profiles')
          .update({ subscription_status: status })
          .eq('id', userId);

        if (error) {
          console.error('Error updating subscription status:', error);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
