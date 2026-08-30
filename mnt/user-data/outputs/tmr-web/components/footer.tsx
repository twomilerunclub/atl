import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="fm">Two Mile Run Club</div>
      <div>Accessible · Consistent · Inclusive</div>
      <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11 }}>
        Founded by Ryan Bouapheng · Atlanta, GA
      </div>
      <div style={{ marginTop: 14, fontSize: 12 }}>
        <Link href="/legal/privacy">Privacy</Link>
        {' · '}
        <Link href="/legal/cookies">Cookies</Link>
        {' · '}
        <button
          type="button"
          className="cookie-link"
          data-open-cookie-preferences
          aria-haspopup="dialog"
        >
          Cookie preferences
        </button>
      </div>
    </footer>
  );
}
