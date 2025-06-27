import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminLanguagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Language Management</h1>
          <p className="text-muted-foreground">Manage platform languages and translations.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Language
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
          <CardDescription>Configure default language and add new translations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Language settings and translation management tools will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
