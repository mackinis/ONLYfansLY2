
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSetting, type PolicySettings } from '@/services/settingsService';

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

export default async function PrivacyPolicyPage() {
  const settings = await getSetting<PolicySettings>('policies');
  const content = settings?.privacyHtmlContent || defaultPrivacyHtmlContent;
  const showDate = settings?.showPrivacyDate === undefined ? true : settings.showPrivacyDate;
  const dateText = settings?.privacyDateText || `Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <Card className="shadow-xl max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">Política de Privacidad</CardTitle>
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
