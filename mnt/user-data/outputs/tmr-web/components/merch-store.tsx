'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CATALOG, COMING_SOON, SIZES, type Sku } from '@/lib/merch/catalog';
import { useToast } from '@/components/toast-provider';
import { CONSENT_COOKIE, parseConsent } from '@/lib/cookies/registry';

interface CartLine {
  key: string;
  sku: Sku;
  name: string;
  detail: string;
  price: number;
  qty: number;
  size?: (typeof SIZES)[number];
}

const PREFS_COOKIE = 'tmr_prefs';

/** The store. Cart lives in component state; money is handled by Stripe. */
export default function MerchStore() {
  const toast = useToast();
  const [color, setColor] = useState<'Black' | 'White'>('Black');
  const [size, setSize] = useState<(typeof SIZES)[number]>('M');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Size/colour memory is a functional cookie, so it is only written once the
  // visitor has allowed that category.
  useEffect(() => {
    const consent = parseConsent(
      document.cookie.split('; ').find((c) => c.startsWith(`${CONSENT_COOKIE}=`))?.split('=')[1]
    );
    if (!consent?.functional) return;

    const saved = document.cookie.split('; ').find((c) => c.startsWith(`${PREFS_COOKIE}=`));
    if (saved) {
      try {
        const prefs = JSON.parse(decodeURIComponent(saved.split('=')[1] ?? ''));
        if (prefs.color === 'Black' || prefs.color === 'White') setColor(prefs.color);
        if (SIZES.includes(prefs.size)) setSize(prefs.size);
      } catch {
        /* ignore malformed preference cookie */
      }
    }
  }, []);

  const rememberPrefs = (nextColor: string, nextSize: string) => {
    const consent = parseConsent(
      document.cookie.split('; ').find((c) => c.startsWith(`${CONSENT_COOKIE}=`))?.split('=')[1]
    );
    if (!consent?.functional) return;
    document.cookie = `${PREFS_COOKIE}=${encodeURIComponent(
      JSON.stringify({ color: nextColor, size: nextSize })
    )}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
  };

  const count = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + l.qty * l.price, 0);

  function addTee() {
    const sku: Sku = color === 'Black' ? 'tee-black' : 'tee-white';
    const key = `${sku}-${size}`;
    setCart((c) => {
      const found = c.find((l) => l.key === key);
      if (found) return c.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [
        ...c,
        { key, sku, name: 'TMR Club Tee', detail: `${color} · ${size}`, price: 20, qty: 1, size },
      ];
    });
    rememberPrefs(color, size);
    toast(`TMR Club Tee (${color} · ${size}) added to cart`);
  }

  function addStickers() {
    setCart((c) => {
      const found = c.find((l) => l.key === 'stickers');
      if (found) return c.map((l) => (l.key === 'stickers' ? { ...l, qty: l.qty + 1 } : l));
      return [
        ...c,
        { key: 'stickers', sku: 'stickers', name: 'TMR Sticker Pack', detail: 'Pack of 3', price: 5, qty: 1 },
      ];
    });
    toast('TMR Sticker Pack added to cart');
  }

  function changeQty(key: string, delta: number) {
    setCart((c) =>
      c.map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0)
    );
  }

  async function checkout() {
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ sku: l.sku, size: l.size, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast(data.error ?? 'Checkout is unavailable right now.');
    } catch {
      toast('Could not reach checkout. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="band">
        <div className="eyebrow on-dark">Club store · Secure checkout by Stripe</div>
        <h1>TMR Merch</h1>
        <p className="sub">Wear the club. Every order helps keep TMR runs free for everyone.</p>
        <div className="pills">
          <a className="pill solid" href="#merchGrid">
            Shop the drop
          </a>
          <button className="pill ghost" onClick={() => (count ? setOpen(true) : toast('Your cart is empty'))}>
            View cart <span className="mono" style={{ marginLeft: 4 }}>({count})</span>
          </button>
        </div>
      </div>

      <div className="wrap content">
        <div
          className="grid3"
          id="merchGrid"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', scrollMarginTop: 80 }}
        >
          <div className="prod">
            <div className="prod-img" style={{ background: color === 'Black' ? 'var(--fog)' : 'var(--coal)' }}>
              <TeeGraphic color={color} />
            </div>
            <div className="prod-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3>TMR Club Tee</h3>
                <span className="price">$20</span>
              </div>
              <p className="muted" style={{ fontSize: 13 }}>
                {CATALOG['tee-black'].description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="swatches">
                  <button
                    className={`swatch ${color === 'Black' ? 'sel' : ''}`}
                    style={{ background: '#0a0a0a' }}
                    aria-label="Black"
                    aria-pressed={color === 'Black'}
                    onClick={() => setColor('Black')}
                  />
                  <button
                    className={`swatch ${color === 'White' ? 'sel' : ''}`}
                    style={{ background: '#fff' }}
                    aria-label="White"
                    aria-pressed={color === 'White'}
                    onClick={() => setColor('White')}
                  />
                </div>
                <span className="muted" style={{ fontSize: 12 }}>
                  {color}
                </span>
              </div>
              <div className="sizes">
                {SIZES.map((s) => (
                  <button
                    className={`size ${size === s ? 'sel' : ''}`}
                    key={s}
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button className="btn dark" style={{ marginTop: 'auto', justifyContent: 'center' }} onClick={addTee}>
                Add to cart — $20
              </button>
            </div>
          </div>

          <div className="prod">
            <div className="prod-img" style={{ background: 'var(--fog)' }}>
              <StickerGraphic />
            </div>
            <div className="prod-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3>TMR Sticker Pack</h3>
                <span className="price">$5</span>
              </div>
              <p className="muted" style={{ fontSize: 13 }}>
                {CATALOG.stickers.description}
              </p>
              <button
                className="btn dark"
                style={{ marginTop: 'auto', justifyContent: 'center' }}
                onClick={addStickers}
              >
                Add to cart — $5
              </button>
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2>Coming soon</h2>
          <span className="eyebrow">Vote on the next drop at a weekly run</span>
        </div>
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          {COMING_SOON.map((s) => (
            <div className="soon" key={s.title}>
              <div className="ic">{s.icon}</div>
              <b>{s.title}</b>
              <div style={{ fontSize: 12 }}>{s.description}</div>
              <span className="tag warn" style={{ marginTop: 10, display: 'inline-block' }}>
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>

      {count > 0 ? (
        <button className="cart-fab show" onClick={() => setOpen(true)}>
          🛒 Cart · {count} · <span className="mono">${total}</span>
        </button>
      ) : null}

      {open ? (
        <div
          className="overlay open"
          role="dialog"
          aria-modal="true"
          aria-label="Cart and checkout"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="eyebrow">Your cart</div>
            <h2>Checkout</h2>

            <div style={{ marginTop: 16 }}>
              {cart.map((l) => (
                <div className="cart-line" key={l.key}>
                  <div>
                    <b>{l.name}</b>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {l.detail} · ${l.price} each
                    </div>
                  </div>
                  <div className="qtybtns">
                    <button onClick={() => changeQty(l.key, -1)} aria-label={`Remove one ${l.name}`}>
                      −
                    </button>
                    <span className="mono">{l.qty}</span>
                    <button onClick={() => changeQty(l.key, 1)} aria-label={`Add one ${l.name}`}>
                      +
                    </button>
                    <span className="mono" style={{ width: 44, textAlign: 'right' }}>
                      ${l.qty * l.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid var(--ink)',
                paddingTop: 14,
                marginTop: 14,
                fontWeight: 700,
              }}
            >
              <span>Total</span>
              <span className="mono">${total}</span>
            </div>

            <button
              className="btn dark"
              style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: 13 }}
              disabled={busy || cart.length === 0}
              onClick={checkout}
            >
              {busy ? 'Opening Stripe…' : 'Pay with Stripe'}
            </button>
            <div className="muted" style={{ fontSize: 11, textAlign: 'center', marginTop: 10 }}>
              You&apos;ll be redirected to Stripe&apos;s secure checkout. Cards, Apple Pay &amp;
              Google Pay accepted.
            </div>
            <button
              className="btn line sm"
              style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
              onClick={() => setOpen(false)}
            >
              Keep shopping
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TeeGraphic({ color }: { color: 'Black' | 'White' }) {
  const fill = color === 'Black' ? '#141414' : '#fdfdfd';
  const stroke = color === 'Black' ? '#000' : '#c9c9c9';
  return (
    <svg className="tee" viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M63 18 L82 10 C86 22 114 22 118 10 L137 18 L172 40 L158 72 L140 62 L140 172 Q100 182 60 172 L60 62 L42 72 L28 40 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {color === 'White' ? <rect x="78" y="78" width="44" height="44" rx="8" fill="#0a0a0a" /> : null}
      <image href="/logo.png" x="79" y="79" width="42" height="42" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

function StickerGraphic() {
  return (
    <svg
      className="tee"
      style={{ width: '56%' }}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="88" fill="#fff" stroke="#d9d9d9" strokeWidth="3" />
      <circle cx="100" cy="100" r="74" fill="#0a0a0a" />
      <image href="/logo.png" x="34" y="34" width="132" height="132" clipPath="circle(66px at 66px 66px)" />
    </svg>
  );
}
