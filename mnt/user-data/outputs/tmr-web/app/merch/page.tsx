import type { Metadata } from 'next';
import MerchStore from '@/components/merch-store';

export const metadata: Metadata = { title: 'Merch' };

/**
 * The store is interactive end to end (cart, size/colour, checkout), so the
 * whole page is one client component. Prices are still resolved server-side in
 * /api/checkout.
 */
export default function MerchPage() {
  return <MerchStore />;
}
