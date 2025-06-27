
'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function CoursesRedirectPage() {
  useEffect(() => {
    redirect('/#courses');
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirigiendo a la sección de cursos...</p>
    </div>
  );
}
