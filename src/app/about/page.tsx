
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSetting, type PolicySettings } from '@/services/settingsService';

const defaultAboutHtmlContent = `<div class="space-y-4 text-center">
  <p class="font-semibold text-xl text-accent">Nuestra Misión</p>
  <p>
    En ONLYfansLY, nuestra misión es proporcionar una plataforma dinámica y atractiva para el aprendizaje y la interacción en vivo. Creemos en el poder del conocimiento y las experiencias compartidas para conectar e inspirar a personas de todo el mundo. Nos esforzamos por ofrecer cursos de alta calidad, transmisiones en vivo fluidas y herramientas interactivas que satisfagan a una audiencia diversa, fomentando una comunidad de aprendices, creadores y entusiastas.
  </p>
</div>
<div class="space-y-4 text-center">
  <h2 class="text-2xl font-headline font-semibold text-accent">Nuestra Visión</h2>
  <p>
    Ser el principal destino en línea donde la creatividad se encuentra con la educación, y donde cada individuo tiene la oportunidad de aprender, compartir y crecer. Visualizamos un universo digital donde los eventos en vivo y los cursos bajo demanda coexisten para crear una experiencia rica e interactiva.
  </p>
</div>
<div class="space-y-4">
  <h2 class="text-2xl font-headline font-semibold text-accent text-center">Nuestros Valores</h2>
  <ul class="list-disc list-inside space-y-3 max-w-2xl mx-auto">
    <li><span class="font-semibold text-primary">Innovación:</span> Evolucionar continuamente nuestra plataforma con la última tecnología para ofrecer una experiencia de usuario superior y herramientas de vanguardia.</li>
    <li><span class="font-semibold text-primary">Comunidad:</span> Fomentar un entorno de apoyo, respeto e interacción, donde los miembros puedan colaborar, aprender unos de otros y construir conexiones significativas.</li>
    <li><span class="font-semibold text-primary">Calidad:</span> Comprometernos con la excelencia en todo lo que hacemos, desde el contenido de nuestros cursos hasta la fiabilidad de nuestra tecnología y el soporte que ofrecemos.</li>
    <li><span class="font-semibold text-primary">Accesibilidad:</span> Esforzarnos por hacer que el aprendizaje y los eventos en vivo sean accesibles para todos, en cualquier lugar, eliminando barreras y promoviendo la inclusión.</li>
  </ul>
</div>`;

export default async function AboutPage() {
  const settings = await getSetting<PolicySettings>('policies');
  const content = settings?.aboutHtmlContent || defaultAboutHtmlContent;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <Card className="shadow-xl max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">Sobre Nosotros</CardTitle>
          </CardHeader>
          <CardContent 
            className="space-y-8 text-lg text-foreground/90"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Card>
      </main>
    </div>
  );
}
