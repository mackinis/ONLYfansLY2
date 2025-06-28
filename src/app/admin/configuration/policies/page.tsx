
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getSetting, type PolicySettings } from '@/services/settingsService';
import { savePolicySettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

const defaultAboutHtmlContent = `<div className="space-y-4 text-center">
  <p className="font-semibold text-xl text-accent">Nuestra Misión</p>
  <p>
    En ONLYfansLY, nuestra misión es proporcionar una plataforma dinámica y atractiva para el aprendizaje y la interacción en vivo. Creemos en el poder del conocimiento y las experiencias compartidas para conectar e inspirar a personas de todo el mundo. Nos esforzamos por ofrecer cursos de alta calidad, transmisiones en vivo fluidas y herramientas interactivas que satisfagan a una audiencia diversa, fomentando una comunidad de aprendices, creadores y entusiastas.
  </p>
</div>
<div className="space-y-4 text-center">
  <h2 className="text-2xl font-headline font-semibold text-accent">Nuestra Visión</h2>
  <p>
    Ser el principal destino en línea donde la creatividad se encuentra con la educación, y donde cada individuo tiene la oportunidad de aprender, compartir y crecer. Visualizamos un universo digital donde los eventos en vivo y los cursos bajo demanda coexisten para crear una experiencia rica e interactiva.
  </p>
</div>
<div className="space-y-4">
  <h2 className="text-2xl font-headline font-semibold text-accent text-center">Nuestros Valores</h2>
  <ul className="list-disc list-inside space-y-3 max-w-2xl mx-auto">
    <li><span className="font-semibold text-primary">Innovación:</span> Evolucionar continuamente nuestra plataforma con la última tecnología para ofrecer una experiencia de usuario superior y herramientas de vanguardia.</li>
    <li><span className="font-semibold text-primary">Comunidad:</span> Fomentar un entorno de apoyo, respeto e interacción, donde los miembros puedan colaborar, aprender unos de otros y construir conexiones significativas.</li>
    <li><span className="font-semibold text-primary">Calidad:</span> Comprometernos con la excelencia en todo lo que hacemos, desde el contenido de nuestros cursos hasta la fiabilidad de nuestra tecnología y el soporte que ofrecemos.</li>
    <li><span className="font-semibold text-primary">Accesibilidad:</span> Esforzarnos por hacer que el aprendizaje y los eventos en vivo sean accesibles para todos, en cualquier lugar, eliminando barreras y promoviendo la inclusión.</li>
  </ul>
</div>`;

const defaultPrivacyHtmlContent = `<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">1. Introducción</h2>
  <p>Bienvenido a ONLYfansLY ("nosotros", "nuestro"). Nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando visita nuestro sitio web y utiliza nuestros servicios. Por favor, lea esta política de privacidad detenidamente. Si no está de acuerdo con los términos de esta política de privacidad, por favor no acceda al sitio.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">2. Recopilación de su Información</h2>
  <p>Podemos recopilar información sobre usted de diversas maneras. La información que podemos recopilar en el Sitio incluye:</p>
  <ul class="list-disc list-inside space-y-2 ml-4">
    <li><strong>Datos Personales:</strong> Información de identificación personal, como su nombre, dirección de correo electrónico, número de teléfono y DNI, que nos proporciona voluntariamente cuando se registra en el Sitio o cuando elige participar en diversas actividades relacionadas con el Sitio.</li>
    <li><strong>Datos Derivados:</strong> Información que nuestros servidores recopilan automáticamente cuando accede al Sitio, como su dirección IP, tipo de navegador, sistema operativo y las páginas que ha visto.</li>
    <li><strong>Datos Financieros:</strong> Datos relacionados con sus métodos de pago (por ejemplo, número de tarjeta de crédito válido, marca de la tarjeta, fecha de vencimiento) que podemos recopilar al comprar, ordenar, devolver o solicitar información sobre nuestros servicios. Almacenamos solo una cantidad muy limitada, si acaso, de información financiera.</li>
  </ul>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">3. Uso de su Información</h2>
  <p>Tener información precisa sobre usted nos permite brindarle una experiencia fluida, eficiente y personalizada. Específicamente, podemos usar la información recopilada sobre usted a través del Sitio para:</p>
  <ul class="list-disc list-inside space-y-2 ml-4">
    <li>Crear y administrar su cuenta.</li>
    <li>Procesar sus transacciones y enviarle información relacionada, incluidas confirmaciones de compra y facturas.</li>
    <li>Mejorar el Sitio y nuestros servicios.</li>
    <li>Prevenir actividades fraudulentas, supervisar contra robos y proteger contra actividades delictivas.</li>
    <li>Enviarle un correo electrónico sobre su cuenta o pedido.</li>
  </ul>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">4. Divulgación de su Información</h2>
  <p>No compartiremos, venderemos, alquilaremos ni comercializaremos su información con terceros para sus fines promocionales. Podemos compartir información que hemos recopilado sobre usted en ciertas situaciones, como por ley o para proteger derechos, con proveedores de servicios de terceros que realizan servicios para nosotros o en nuestro nombre, o durante transferencias comerciales.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">5. Seguridad de su Información</h2>
  <p>Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger su información personal. Si bien hemos tomado medidas razonables para proteger la información personal que nos proporciona, tenga en cuenta que, a pesar de nuestros esfuerzos, ninguna medida de seguridad es perfecta o impenetrable, y ningún método de transmisión de datos puede garantizarse contra cualquier intercepción u otro tipo de uso indebido.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">6. Contacto</h2>
  <p>Si tiene preguntas o comentarios sobre esta Política de Privacidad, por favor contáctenos a través de nuestro <a href="/contact" class="text-primary hover:underline">formulario de contacto</a> o al correo electrónico: legal@onlyfansly.example.com</p>
</section>`;

const defaultTermsHtmlContent = `<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">1. Aceptación de los Términos</h2>
  <p>Al acceder o utilizar ONLYfansLY (el "Servicio"), usted acepta estar sujeto a estos Términos de Servicio ("Términos"). Si no está de acuerdo con alguna parte de los términos, no podrá acceder al Servicio. Estos Términos se aplican a todos los visitantes, usuarios y otras personas que accedan o utilicen el Servicio.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">2. Cuentas de Usuario</h2>
  <p>Cuando crea una cuenta con nosotros, debe proporcionarnos información precisa, completa y actualizada en todo momento. El no hacerlo constituye una violación de los Términos, lo que puede resultar en la terminación inmediata de su cuenta en nuestro Servicio. Usted es responsable de salvaguardar la contraseña que utiliza para acceder al Servicio y de cualquier actividad o acción bajo su contraseña.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">3. Contenido del Usuario</h2>
  <p>Nuestro Servicio le permite publicar, enlazar, almacenar, compartir y de otra manera hacer disponible cierta información, texto, gráficos, videos u otro material ("Contenido"). Usted es responsable del Contenido que publica en el Servicio, incluida su legalidad, fiabilidad y adecuación. Al publicar Contenido en el Servicio, nos otorga el derecho y la licencia para usar, modificar, ejecutar públicamente, mostrar públicamente, reproducir y distribuir dicho Contenido en y a través del Servicio.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">4. Propiedad Intelectual</h2>
  <p>El Servicio y su contenido original (excluyendo el Contenido proporcionado por los usuarios), características y funcionalidades son y seguirán siendo propiedad exclusiva de ONLYfansLY y sus licenciantes. El Servicio está protegido por derechos de autor, marcas registradas y otras leyes tanto de la jurisdicción aplicable como de países extranjeros.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">5. Terminación de la Cuenta</h2>
  <p>Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumple los Términos. Tras la terminación, su derecho a utilizar el Servicio cesará inmediatamente.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">6. Legislación Aplicable</h2>
  <p>Estos Términos se regirán e interpretarán de acuerdo con las leyes de la jurisdicción correspondiente, sin tener en cuenta sus disposiciones sobre conflicto de leyes.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">7. Cambios en los Términos</h2>
  <p>Nos reservamos el derecho, a nuestra entera discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigencia. Lo que constituye un cambio material se determinará a nuestra entera discreción.</p>
</section>
<section>
  <h2 class="text-2xl font-headline font-semibold mb-2 text-accent">8. Contacto</h2>
  <p>Si tiene alguna pregunta sobre estos Términos, por favor contáctenos a través de nuestro <a href="/contact" class="text-primary hover:underline">formulario de contacto</a> o al correo electrónico: legal@onlyfansly.example.com</p>
</section>`;


export default function AdminPoliciesPage() {
  const [aboutContent, setAboutContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');
  
  const [showPrivacyDate, setShowPrivacyDate] = useState(true);
  const [privacyDateText, setPrivacyDateText] = useState(`Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  
  const [showTermsDate, setShowTermsDate] = useState(true);
  const [termsDateText, setTermsDateText] = useState(`Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<PolicySettings>('policies');
        setAboutContent(settings?.aboutHtmlContent || defaultAboutHtmlContent);
        setPrivacyContent(settings?.privacyHtmlContent || defaultPrivacyHtmlContent);
        setTermsContent(settings?.termsHtmlContent || defaultTermsHtmlContent);
        
        setShowPrivacyDate(settings?.showPrivacyDate === undefined ? true : settings.showPrivacyDate);
        setPrivacyDateText(settings?.privacyDateText || `Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        
        setShowTermsDate(settings?.showTermsDate === undefined ? true : settings.showTermsDate);
        setTermsDateText(settings?.termsDateText || `Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`);

      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los ajustes de políticas.", variant: "destructive" });
        setAboutContent(defaultAboutHtmlContent);
        setPrivacyContent(defaultPrivacyHtmlContent);
        setTermsContent(defaultTermsHtmlContent);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = () => {
    const settingsData: PolicySettings = {
      aboutHtmlContent: aboutContent,
      privacyHtmlContent: privacyContent,
      termsHtmlContent: termsContent,
      showPrivacyDate,
      privacyDateText,
      showTermsDate,
      termsDateText,
    };
    startTransition(async () => {
      const result = await savePolicySettingsAction(settingsData);
      toast({
        title: result.success ? "¡Éxito!" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Gestión de Políticas</h1>
          <p className="text-muted-foreground">Edita el contenido de las páginas de políticas, privacidad y sobre nosotros.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Página "Sobre Nosotros"</CardTitle>
          <CardDescription>Edita el contenido HTML de la página. Ten cuidado de no romper la estructura.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
            rows={15}
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Página "Política de Privacidad"</CardTitle>
          <CardDescription>Edita el contenido HTML de la página.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="showPrivacyDate" checked={showPrivacyDate} onCheckedChange={setShowPrivacyDate} />
            <Label htmlFor="showPrivacyDate">Mostrar fecha de última actualización</Label>
          </div>
          {showPrivacyDate && (
             <div className="space-y-2">
                <Label htmlFor="privacyDateText">Texto de la fecha</Label>
                <Input id="privacyDateText" value={privacyDateText} onChange={(e) => setPrivacyDateText(e.target.value)} />
             </div>
          )}
          <Textarea 
            value={privacyContent}
            onChange={(e) => setPrivacyContent(e.target.value)}
            rows={15}
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Página "Términos de Servicio"</CardTitle>
          <CardDescription>Edita el contenido HTML de la página.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center space-x-2">
            <Switch id="showTermsDate" checked={showTermsDate} onCheckedChange={setShowTermsDate} />
            <Label htmlFor="showTermsDate">Mostrar fecha de última actualización</Label>
          </div>
          {showTermsDate && (
             <div className="space-y-2">
                <Label htmlFor="termsDateText">Texto de la fecha</Label>
                <Input id="termsDateText" value={termsDateText} onChange={(e) => setTermsDateText(e.target.value)} />
             </div>
          )}
          <Textarea 
            value={termsContent}
            onChange={(e) => setTermsContent(e.target.value)}
            rows={15}
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Toda la Configuración"}
        </Button>
      </div>
    </div>
  );
}
