import type { Metadata } from 'next';
import Link from 'next/link';

import Band from '@/components/band';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <>
      <Band
        eyebrow="Last updated August 2026"
        title="Privacy"
        sub="What we collect, why we need it, and how to get it back or delete it."
      />

      <div className="wrap content" style={{ maxWidth: 760 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            What we collect
          </div>
          <p style={{ marginBottom: 14 }}>
            When you join, we collect your name and email (to create your account), your running
            details (to place you on the leaderboard), and an emergency contact plus any medical
            notes you choose to share (so run leads can help if something goes wrong on a run).
            Address details are optional and used only for merch shipping.
          </p>

          <div className="eyebrow" style={{ margin: '22px 0 10px' }}>
            Who can see it
          </div>
          <p style={{ marginBottom: 14 }}>
            Your name, points, and runs appear on the leaderboard according to the visibility setting
            on your profile. Emergency contacts, medical notes, and address are never shown to other
            members — only to you and club admins. Payment card details go straight to Stripe and are
            never stored on our servers.
          </p>

          <div className="eyebrow" style={{ margin: '22px 0 10px' }}>
            Your choices
          </div>
          <p style={{ marginBottom: 14 }}>
            You can change your profile visibility at any time, adjust cookie settings from the{' '}
            <Link href="/legal/cookies">cookie policy</Link>, and ask us to export or delete your
            account and its data. Deleting your account removes your profile, runs, posts, and
            private details.
          </p>

          <div className="eyebrow" style={{ margin: '22px 0 10px' }}>
            Contact
          </div>
          <p>
            Questions or a data request: reach out to the club at a weekly run, or email the address
            listed on our Luma page.
          </p>
        </div>
      </div>
    </>
  );
}
