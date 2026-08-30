/**
 * Single source of truth for the point system and badge list, exactly as the
 * original site defined it. Displayed on Leaderboard, Profile, and Dashboard.
 * The award amounts are enforced server-side in SQL triggers; this module is
 * the presentation copy for those same rules.
 */

export interface PointRule {
  title: string;
  description: string;
  points: string;
}

export const POINT_RULES: PointRule[] = [
  { title: 'Per run', description: 'Every logged & approved run', points: '+10' },
  { title: 'Weekly volume bonus', description: '3+ runs in one week', points: '+15' },
  { title: 'Performance', description: 'Based on pace & effort each run', points: '+5–20' },
  { title: 'Weekly streak', description: 'Keep a running streak alive', points: '+5–20' },
  { title: 'Referral', description: 'Bring a new member to TMR', points: '+25' },
  { title: 'Referral bonus', description: 'Your referral attends 3+ runs', points: '+15' },
];

export interface Badge {
  slug: string;
  icon: string;
  title: string;
  description: string;
  points: number;
}

export const BADGES: Badge[] = [
  { slug: 'friend', icon: '🤝', title: 'Bring a Runner', description: 'Invite a friend who runs', points: 10 },
  { slug: 'consist', icon: '📆', title: 'Consistency', description: '5 consistent runs', points: 20 },
  { slug: 'tenk', icon: '⚡', title: '10K Finisher', description: 'Run a 10K', points: 15 },
  { slug: 'tenmi', icon: '🏃', title: 'Double Digits', description: 'Run 10 miles', points: 30 },
  { slug: 'half', icon: '🥈', title: 'Half Marathon', description: 'Run 13.1 miles', points: 40 },
  { slug: 'full', icon: '🏅', title: 'Full Marathon', description: 'Run 26.2 miles', points: 50 },
];
