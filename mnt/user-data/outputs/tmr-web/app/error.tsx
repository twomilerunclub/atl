'use client';

import Band from '@/components/band';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <Band
        eyebrow="Something broke"
        title="Hit a Pothole"
        sub="The page didn't load. Trying again usually fixes it."
      />
      <div className="wrap content" style={{ textAlign: 'center' }}>
        <button className="btn dark" onClick={reset}>
          Try again
        </button>
      </div>
    </>
  );
}
