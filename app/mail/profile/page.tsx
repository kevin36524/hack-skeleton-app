'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main mail page - profile is now a tab within the mail page
    router.replace('/mail');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
