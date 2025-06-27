
'use client';

import { useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendContactEmailAction } from './actions';
import { Loader2 } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Por favor, introduce un email válido."),
  subject: z.string().min(1, "El asunto es requerido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormData> = (data) => {
    startTransition(async () => {
      const result = await sendContactEmailAction(data);
      if (result.success) {
        toast({
          title: "¡Mensaje Enviado!",
          description: result.message,
        });
        reset();
      } else {
        const errorMessage = result.errors ? result.errors.map(e => e.message).join(' ') : result.message;
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl md:text-5xl font-headline text-center text-primary">Contáctanos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              ¿Tienes preguntas o comentarios? Nos encantaría saber de ti. Completa el formulario a continuación o contáctanos a través de nuestras redes sociales.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu Nombre" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" placeholder="Referente a..." {...register("subject")} />
                {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" placeholder="Tu mensaje..." rows={5} {...register("message")} />
                {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSending ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
