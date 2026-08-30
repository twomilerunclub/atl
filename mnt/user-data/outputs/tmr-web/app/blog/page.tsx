import type { Metadata } from 'next';

import Band from '@/components/band';
import { PostCard, PostComposer } from '@/components/blog-feed';
import { requireProfile } from '@/lib/auth/guards';
import { getApprovedPosts } from '@/lib/database/queries';

export const metadata: Metadata = { title: 'Blog' };
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const profile = await requireProfile();
  const posts = await getApprovedPosts(profile.id);

  return (
    <>
      <Band
        eyebrow="Members only · Admin approved"
        title="TMR Blog"
        sub="Photos and stories from the road. Up to 3 photos per post."
      />

      <div className="wrap content" style={{ maxWidth: 680 }}>
        <PostComposer />
        {posts.length === 0 ? (
          <div className="locknote">
            <p style={{ margin: 0 }}>
              Nothing published yet. Share the first run and it appears here once an admin approves
              it.
            </p>
          </div>
        ) : (
          posts.map((p) => <PostCard post={p} key={p.id} />)
        )}
      </div>
    </>
  );
}
