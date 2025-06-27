
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getSetting, MoneySettings, CurrencyOption } from '@/services/settingsService';
import { saveMoneySettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_CURRENCY: CurrencyOption = 'ARS';
const DEFAULT_ARS_SYMBOL = 'AR$';
const DEFAULT_USD_SYMBOL = '$';
const DEFAULT_EXCHANGE_RATE = 1000; // Example default

export default function AdminMoneyPage() {
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyOption>(DEFAULT_CURRENCY);
  const [arsSymbol, setArsSymbol] = useState(DEFAULT_ARS_SYMBOL);
  const [usdSymbol, setUsdSymbol] = useState(DEFAULT_USD_SYMBOL);
  const [exchangeRateArsToUsd, setExchangeRateArsToUsd] = useState<number | string>(DEFAULT_EXCHANGE_RATE);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<MoneySettings>('money');
        if (settings) {
          setDefaultCurrency(settings.defaultCurrency || DEFAULT_CURRENCY);
          setArsSymbol(settings.showArsSymbol || DEFAULT_ARS_SYMBOL);
          setUsdSymbol(settings.showUsdSymbol || DEFAULT_USD_SYMBOL);
          setExchangeRateArsToUsd(settings.exchangeRateArsToUsd === undefined ? DEFAULT_EXCHANGE_RATE : settings.exchangeRateArsToUsd);
        } else {
          setExchangeRateArsToUsd(DEFAULT_EXCHANGE_RATE);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load money settings.",
          variant: "destructive",
        });
        setExchangeRateArsToUsd(DEFAULT_EXCHANGE_RATE);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    const rate = parseFloat(exchangeRateArsToUsd.toString());
    if (isNaN(rate) || rate <= 0) {
        toast({
            title: "Error de Validación",
            description: "Por favor, introduce un tipo de cambio válido y positivo.",
            variant: "destructive",
        });
        return;
    }

    const settingsData: MoneySettings = {
      defaultCurrency,
      showArsSymbol: arsSymbol,
      showUsdSymbol: usdSymbol,
      exchangeRateArsToUsd: rate,
    };

    startTransition(async () => {
      const result = await saveMoneySettingsAction(settingsData);
      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-6 w-1/4 mb-2" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Gestión Financiera</h1>
        <p className="text-muted-foreground">Configura las opciones de moneda para los cursos y visualiza reportes (reportes futuros).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Moneda de Cursos</CardTitle>
          <CardDescription>Elige cómo se mostrarán los precios de los cursos en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Moneda por Defecto / Opciones de Visualización</Label>
            <RadioGroup value={defaultCurrency} onValueChange={(value) => setDefaultCurrency(value as CurrencyOption)} className="space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ARS" id="curr-ars" />
                <Label htmlFor="curr-ars">Pesos Argentinos (AR$) como principal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USD" id="curr-usd" />
                <Label htmlFor="curr-usd">Dólares Estadounidenses (USD $) como principal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BOTH" id="curr-both" />
                <Label htmlFor="curr-both">Mostrar Ambas (AR$ y USD $)</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">Esto afectará cómo se muestran los precios. La entrada de precios en el formulario de cursos seguirá siendo un campo de texto.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arsSymbol">Símbolo para Pesos Argentinos</Label>
              <Input id="arsSymbol" value={arsSymbol} onChange={(e) => setArsSymbol(e.target.value)} placeholder="AR$" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdSymbol">Símbolo para Dólares</Label>
              <Input id="usdSymbol" value={usdSymbol} onChange={(e) => setUsdSymbol(e.target.value)} placeholder="$" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangeRate">Tipo de Cambio (ARS por 1 USD)</Label>
            <Input 
              id="exchangeRate" 
              type="number" 
              value={exchangeRateArsToUsd} 
              onChange={(e) => setExchangeRateArsToUsd(e.target.value)} 
              placeholder="Ej: 1000" 
              min="0.01"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">Define cuántos pesos argentinos equivalen a un dólar estadounidense. Se usará si muestras precios en ambas monedas o para conversiones.</p>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Configuración de Moneda'}
            </Button>
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Reportes de Ingresos (Próximamente)</CardTitle>
          <CardDescription>Visualiza reportes financieros y gestiona configuraciones de pago.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Los dashboards financieros y herramientas de gestión estarán disponibles aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    