'use client';

import { useTransition } from 'react';
import { updateProfile } from '@/lib/database/actions';
import { useToast } from '@/components/toast-provider';
import type { Profile } from '@/types';

/** Visibility select from the original profile card, now persisted server-side. */
export default function ProfileVisibility({ profile }: { profile: Profile }) {
  const [pending, start] = useTransition();
  const toast = useToast();

  return (
    <select
      defaultValue={profile.visibility}
      disabled={pending}
      aria-label="Profile visibility"
      style={{ border: '1px solid var(--mist)', borderRadius: 99, padding: '4px 10px', fontSize: 12 }}
      onChange={(e) => {
        const value = e.target.value;
        start(async () => {
          const fd = new FormData();
          fd.set('fullName', profile.full_name);
          fd.set('goal', profile.goal ?? '');
          fd.set('experience', profile.experience ?? '');
          fd.set('typicalPace', profile.typical_pace ?? '');
          fd.set('visibility', value);
          const res = await updateProfile(null, fd);
          toast(res.ok ? `Visibility set to ${value}` : res.error);
        });
      }}
    >
      <option value="public">Public</option>
      <option value="members">Members only</option>
      <option value="private">Private</option>
    </select>
  );
}
