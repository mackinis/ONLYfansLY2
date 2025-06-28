
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminLanguagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Gestión de Idiomas</h1>
          <p className="text-muted-foreground">Gestiona los idiomas y traducciones de la plataforma.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Idioma
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Idiomas Soportados</CardTitle>
          <CardDescription>Configura el idioma por defecto y añade nuevas traducciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Los ajustes de idioma y las herramientas de gestión de traducciones estarán disponibles aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
