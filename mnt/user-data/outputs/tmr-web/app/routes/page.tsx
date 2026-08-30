import type { Metadata } from 'next';
import Link from 'next/link';

import Band from '@/components/band';
import LockGate from '@/components/lock-gate';
import RouteCard from '@/components/route-card';
import RouteSuggestForm from '@/components/route-suggest-form';
import { getCurrentProfile } from '@/lib/auth/guards';
import { getRoutes } from '@/lib/database/queries';

export const metadata: Metadata = { title: 'Routes' };

export default async function RoutesPage() {
  const profile = await getCurrentProfile();
  const routes = await getRoutes(profile?.id);
  const maxLikes = Math.max(0, ...routes.map((r) => r.likes));

  return (
    <>
      <Band
        eyebrow="Video preview + route stats + runner reviews"
        title="TMR Routes"
        sub="See the route, check the stats, and decide if it's your next run."
      >
        <Link className="pill solid" href="#routeCards">
          Where we run
        </Link>
        <Link className="pill ghost" href="#routeSuggestBox">
          Suggest a new route
        </Link>
      </Band>

      <div className="wrap content">
        <div
          className="grid3"
          id="routeCards"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', scrollMarginTop: 80 }}
        >
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              featured={route.likes === maxLikes && maxLikes > 0}
              signedIn={Boolean(profile)}
            />
          ))}
        </div>

        <div className="section-head">
          <h2>Suggest a Route</h2>
          <span className="eyebrow">Registered runners only</span>
        </div>
        <div id="routeSuggestBox" style={{ scrollMarginTop: 80 }}>
          {profile ? <RouteSuggestForm /> : <LockGate feature="Suggesting new routes" />}
        </div>
      </div>
    </>
  );
}
