'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminConfigurationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/configuration/general');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting to General Configuration...</p>
      {/* You can add a spinner or loading animation here */}
    </div>
  );
}
