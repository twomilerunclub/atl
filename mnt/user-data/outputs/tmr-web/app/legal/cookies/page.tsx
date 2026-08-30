import type { Metadata } from 'next';

import Band from '@/components/band';
import { CATEGORY_COPY, COOKIE_REGISTRY, CONSENT_VERSION } from '@/lib/cookies/registry';

export const metadata: Metadata = { title: 'Cookie policy' };

export default function CookiePolicyPage() {
  return (
    <>
      <Band
        eyebrow={`Policy version ${CONSENT_VERSION}`}
        title="Cookies"
        sub="Exactly what we store on your device, why, and for how long."
      />

      <div className="wrap content" style={{ maxWidth: 820 }}>
        <div className="card" style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 14 }}>
            Nothing beyond the necessary cookies is set until you choose. You can change your mind
            at any time with the{' '}
            <button type="button" className="cookie-link" data-open-cookie-preferences>
              cookie preferences
            </button>{' '}
            link, which also appears in the footer of every page.
          </p>
        </div>

        {(Object.keys(CATEGORY_COPY) as (keyof typeof CATEGORY_COPY)[]).map((cat) => {
          const entries = COOKIE_REGISTRY.filter((c) => c.category === cat);
          return (
            <section key={cat} style={{ marginBottom: 30 }}>
              <div className="section-head" style={{ marginTop: 0 }}>
                <h2>{CATEGORY_COPY[cat].title}</h2>
                <span className="eyebrow">
                  {CATEGORY_COPY[cat].alwaysOn ? 'Always on' : 'Off until you allow it'}
                </span>
              </div>
              <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
                {CATEGORY_COPY[cat].description}
              </p>

              {entries.length ? (
                <table className="cookie-table">
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Provider</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((c) => (
                      <tr key={c.name}>
                        <td className="mono" style={{ fontSize: 12 }}>
                          {c.name}
                        </td>
                        <td>{c.provider}</td>
                        <td>{c.purpose}</td>
                        <td>{c.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="muted" style={{ fontSize: 13 }}>
                  We do not currently set any cookies in this category.
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
