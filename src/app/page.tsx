'use client'; 

import { useEffect, useState } from 'react';
import { HeroBanner } from '@/components/ui/hero-banner';
import { CourseCard, type Course } from '@/components/ui/course-card';
import { UserStories } from '@/components/ui/user-stories'; 
import { siteConfig } from '@/config/site';
import { Separator } from '@/components/ui/separator';
import { getSetting, GeneralSettings } from '@/services/settingsService';
import { getCourses } from '@/services/courseService'; 
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from 'lucide-react';
import { HomepagePopup } from '@/components/ui/homepage-popup';

export default function HomePage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      setErrorLoadingData(null);
      try {
        const [genSettings, fetchedCourses] = await Promise.all([
          getSetting<GeneralSettings>('general'),
          getCourses(),
        ]);
        setGeneralSettings(genSettings);
        setCourses(fetchedCourses);

      } catch (error) {
        console.error("Failed to load data for homepage:", error);
        const specificErrorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        const userFriendlyMessage = `Error al cargar datos para la página principal (${specificErrorMessage}). Es posible que algunas partes del sitio no funcionen correctamente. Por favor, verifica tu conexión y la configuración de Firebase (Firestore habilitado, ID de proyecto correcto y reglas de seguridad).`;
        setErrorLoadingData(userFriendlyMessage);
        toast({
          title: "Error de Carga",
          description: userFriendlyMessage,
          variant: "destructive",
          duration: 15000, 
        });
        setCourses([]); 
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, [toast]);

  const heroConfig = {
    mainText: generalSettings?.heroMainText || siteConfig.defaultHero.mainText,
    secondaryText: generalSettings?.heroSecondaryText || siteConfig.defaultHero.secondaryText,
    descriptionText: generalSettings?.heroDescriptionText || siteConfig.defaultHero.descriptionText,
    mainTextColor: generalSettings?.heroMainTextColor || siteConfig.defaultHero.mainTextColor,
    heroImageUrl: generalSettings?.heroImageUrl || siteConfig.defaultHero.heroImageUrl,
  };
  

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <section className="w-full py-20 md:py-32 bg-gradient-to-br from-background to-secondary">
            <div className="container mx-auto px-4 text-center">
              <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
              <Skeleton className="h-8 w-1/2 mx-auto mb-10" />
              <Skeleton className="h-12 w-48 mx-auto" />
            </div>
          </section>
          <Separator className="my-8 md:my-12" />
           <section className="py-12 md:py-20 bg-background">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-1/2 mx-auto mb-10 md:mb-16" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-96 rounded-lg" />)}
              </div>
            </div>
          </section>
          <Separator className="my-8 md:my-12" />
          <section className="py-12 md:py-20 bg-secondary">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-1/2 mx-auto mb-10 md:mb-16" />
              <Skeleton className="w-full max-w-lg h-48 mx-auto" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomepagePopup />
      <main className="flex-grow">
        {errorLoadingData && (
          <div className="container mx-auto px-4 py-4">
            <div role="alert" className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-md flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Error al Cargar Datos</h3>
                <p className="text-sm">{errorLoadingData}</p>
              </div>
            </div>
          </div>
        )}

        <HeroBanner {...heroConfig} />
        
        <section id="courses" className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-10 md:mb-16 text-primary">
              Cursos Destacados
            </h2>
            {courses.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-8">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-xl text-muted-foreground">
                  {errorLoadingData ? "No se pudieron cargar los cursos debido a un error." : "No hay cursos disponibles en este momento."}
                </p>
                 {!errorLoadingData && <p className="mt-2 text-sm">Intenta de nuevo más tarde o contacta al administrador.</p>}
              </div>
            )}
          </div>
        </section>

        <Separator className="my-8 md:my-12" />
        
        <section id="stories" className="py-12 md:py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-10 md:mb-16 text-accent">
              Historias Destacadas
            </h2>
            <UserStories />
          </div>
        </section>
      </main>
    </div>
  );
}
