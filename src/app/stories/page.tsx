
'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function StoriesRedirectPage() {
  useEffect(() => {
    redirect('/#stories');
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirigiendo a la sección de historias...</p>
    </div>
  );
}
