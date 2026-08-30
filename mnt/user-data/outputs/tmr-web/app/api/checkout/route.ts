import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createClient } from '@/lib/supabase/server';
import { checkoutSchema } from '@/lib/validation/schemas';
import { CATALOG } from '@/lib/merch/catalog';

/**
 * Creates a Stripe Checkout Session. The client sends SKUs and quantities only;
 * names and prices are read from the server-side catalogue.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Checkout is not configured yet.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Your cart could not be read.' }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: parsed.data.items.map((item) => {
      const product = CATALOG[item.sku];
      return {
        quantity: item.qty,
        price_data: {
          currency: 'usd',
          unit_amount: product.unitAmount,
          product_data: {
            name: product.name + (item.size ? ` (${item.size})` : ''),
            description: product.description,
          },
        },
      };
    }),
    customer_email: user?.email,
    client_reference_id: user?.id,
    shipping_address_collection: { allowed_countries: ['US', 'CA'] },
    success_url: `${siteUrl}/merch?paid=1`,
    cancel_url: `${siteUrl}/merch?canceled=1`,
    metadata: { items: JSON.stringify(parsed.data.items).slice(0, 480) },
  });

  return NextResponse.json({ url: session.url });
}
