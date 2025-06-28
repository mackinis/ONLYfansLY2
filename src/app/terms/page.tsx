
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSetting, type PolicySettings } from '@/services/settingsService';

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

export default async function TermsOfServicePage() {
  const settings = await getSetting<PolicySettings>('policies');
  const content = settings?.termsHtmlContent || defaultTermsHtmlContent;
  const showDate = settings?.showTermsDate === undefined ? true : settings.showTermsDate;
  const dateText = settings?.termsDateText || `Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <Card className="shadow-xl max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">Términos de Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base leading-relaxed text-foreground/90">
             {showDate && <p className="text-muted-foreground text-center">{dateText}</p>}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
