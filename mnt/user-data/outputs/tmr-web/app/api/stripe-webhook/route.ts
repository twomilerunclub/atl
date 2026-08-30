import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * Records paid orders. This is the only place the service-role key is used,
 * because there is no user session on a webhook request. The signature check
 * below is what makes that safe: an unsigned request never reaches the client.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const supabase = createAdminClient();

    await supabase.from('orders').upsert(
      {
        user_id: session.client_reference_id ?? null,
        stripe_session_id: session.id,
        email: session.customer_details?.email ?? null,
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        status: 'paid',
        items: session.metadata?.items ? JSON.parse(session.metadata.items) : [],
      },
      { onConflict: 'stripe_session_id' }
    );
  }

  return NextResponse.json({ received: true });
}
