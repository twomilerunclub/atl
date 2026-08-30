/**
 * Merch catalogue. Prices live on the server only: the checkout route looks up
 * the price by SKU and ignores anything the browser sends, so a tampered cart
 * cannot buy a $20 tee for $1.
 */

export type Sku = 'tee-black' | 'tee-white' | 'stickers';

export interface CatalogItem {
  sku: Sku;
  name: string;
  unitAmount: number; // cents
  description: string;
  kind: 'tee' | 'sticker';
  color?: 'Black' | 'White';
}

export const CATALOG: Record<Sku, CatalogItem> = {
  'tee-black': {
    sku: 'tee-black',
    name: 'TMR Club Tee — Black',
    unitAmount: 2000,
    description: 'Heavyweight cotton, club logo across the chest. The official weekly-run uniform.',
    kind: 'tee',
    color: 'Black',
  },
  'tee-white': {
    sku: 'tee-white',
    name: 'TMR Club Tee — White',
    unitAmount: 2000,
    description: 'Heavyweight cotton, club logo across the chest. The official weekly-run uniform.',
    kind: 'tee',
    color: 'White',
  },
  stickers: {
    sku: 'stickers',
    name: 'TMR Sticker Pack',
    unitAmount: 500,
    description: 'Pack of 3 die-cut logo stickers. Water bottles, laptops, foam rollers.',
    kind: 'sticker',
  },
};

export const SIZES = ['S', 'M', 'L', 'XL'] as const;

export const COMING_SOON = [
  { icon: '🧥', title: 'TMR Hoodie', description: 'For the cold-morning crew' },
  { icon: '🧢', title: 'Run Cap', description: 'Black on black embroidery' },
  { icon: '🍶', title: 'Club Bottle', description: 'Post-run hydration' },
  { icon: '🎽', title: 'Race Singlet', description: 'For when 2 miles becomes 26.2' },
];
