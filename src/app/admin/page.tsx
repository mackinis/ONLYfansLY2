
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Edit3, BookOpen, Users, Radio, FileCheck2, Loader2 } from "lucide-react";
import Link from "next/link";
import { getCourses } from '@/services/courseService';
import { getAllUsers } from '@/services/userService';
import { getAdminStories } from '@/services/storyService';
import { io, type Socket } from 'socket.io-client';

interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

function QuickAccessCard({ title, description, href, icon: Icon }: QuickAccessCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium font-headline">{title}</CardTitle>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        <Button variant="outline" size="sm" asChild>
          <Link href={href}>Ir a {title.split(' ')[0]}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}


interface InfoBoxProps {
  title: string;
  value: string | number;
  isLoading: boolean;
  icon: React.ElementType;
}

function InfoBox({ title, value, isLoading, icon: Icon }: InfoBoxProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <p className="text-2xl font-bold text-primary">{value}</p>
      )}
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    courses: 0,
    users: 0,
    stories: 0,
    liveViewers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const [coursesData, usersData, storiesData] = await Promise.all([
          getCourses(),
          getAllUsers(),
          getAdminStories('approved')
        ]);
        
        setStats(prev => ({
          ...prev,
          courses: coursesData.length,
          users: usersData.filter(u => u.role !== 'admin').length,
          stories: storiesData.length,
        }));
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
    
    // Socket connection for live viewers
    const socket = io({ path: '/api/socket_io' });
    
    const USER_SESSION_KEY = 'onlyfansly_user_session';
    const session = localStorage.getItem(USER_SESSION_KEY);
    const isAdmin = session ? JSON.parse(session).role === 'admin' : false;
    const userId = session ? JSON.parse(session).uid : null;

    socket.on('connect', () => {
      if(isAdmin && userId) {
         // Identify as admin to the socket server
         socket.emit('identify', { userId, isAdmin: true, displayName: 'Admin' });
         socket.emit('admin:request-dashboard-stats');
      }
    });

    socket.on('server:dashboard-stats-update', (data) => {
      if (data && typeof data.liveViewers === 'number') {
        setStats(prev => ({ ...prev, liveViewers: data.liveViewers }));
      }
    });

    const interval = setInterval(() => {
       if(socket.connected && isAdmin) {
         socket.emit('admin:request-dashboard-stats');
       }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Panel de Administración</CardTitle>
          <CardDescription>Bienvenido al Panel de Administración de ONLYfansLY. Gestiona el contenido y la configuración de tu plataforma aquí.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Desde aquí, puedes gestionar cursos, configurar ajustes de transmisión en vivo, actualizar el contenido de la página de inicio y mucho más. Usa la navegación de la barra lateral para acceder a las diferentes secciones del panel de administración.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAccessCard
              title="Gestionar Cursos"
              description="Añade, edita o elimina cursos disponibles en tu plataforma."
              href="/admin/courses"
              icon={Edit3}
            />
            <QuickAccessCard
              title="Ajustes de Livestream"
              description="Configura la URL y disponibilidad de tu transmisión en vivo."
              href="/admin/livestream"
              icon={Settings}
            />
            <QuickAccessCard
              title="Configuración General"
              description="Actualiza los ajustes de todo el sitio, la apariencia y los detalles de la cuenta de administrador."
              href="/admin/configuration/general"
              icon={Settings}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Resumen de la Plataforma</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBox title="Cursos Totales" value={stats.courses} isLoading={isLoading} icon={BookOpen} />
          <InfoBox title="Usuarios Activos" value={stats.users} isLoading={isLoading} icon={Users} />
          <InfoBox title="Historias Aprobadas" value={stats.stories} isLoading={isLoading} icon={FileCheck2} />
          <InfoBox title="Espectadores en Vivo" value={stats.liveViewers} isLoading={false} icon={Radio} />
        </CardContent>
      </Card>
    </div>
  );
}
