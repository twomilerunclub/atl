'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { initials } from '@/lib/format';
import type { Profile } from '@/types';

const PAGES = [
  { href: '/', label: 'Home', guest: true },
  { href: '/about', label: 'About', guest: true },
  { href: '/runs', label: 'Runs', guest: true },
  { href: '/routes', label: 'Routes', guest: true },
  { href: '/leaderboard', label: 'Leaderboard', guest: true },
  { href: '/dashboard', label: 'Dashboard', guest: false },
  { href: '/profile', label: 'Profile', guest: false },
  { href: '/blog', label: 'Blog', guest: false },
  { href: '/merch', label: 'Merch', guest: true },
];

export default function Nav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();

  return (
    <nav>
      <div className="nav-brand">
        <Image src="/logo.png" alt="TMR Club logo" width={34} height={34} priority />
        <span>TMR</span>
      </div>

      <div className="nav-links">
        {PAGES.map((p) => {
          const active = p.href === '/' ? pathname === '/' : pathname.startsWith(p.href);
          return (
            <Link key={p.href} href={p.href} className={`nav-btn ${active ? 'active' : ''}`}>
              {p.label}
              {!p.guest && !profile ? ' 🔒' : ''}
            </Link>
          );
        })}
      </div>

      <div className="nav-right">
        {profile ? (
          <>
            <span className="nav-user">
              <span className="avatar">{initials(profile.full_name)}</span>
              {profile.full_name.split(' ')[0]}
              <span className="role-chip">{profile.role}</span>
            </span>
            <Link href="/auth/signout" className="nav-btn" prefetch={false}>
              Sign out
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="nav-btn">
              Sign in
            </Link>
            <Link href="/auth/signup" className="nav-cta">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
