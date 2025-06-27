
'use client'; 

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail
} from "@/components/ui/sidebar";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { AppLogo } from "@/components/icons/app-logo";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const USER_SESSION_KEY = 'onlyfansly_user_session';

interface UserSessionData {
  uid: string;
  email: string;
  role?: string;
  isVerified: boolean;
  // ...otros datos
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserSessionData | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    console.log("AdminLayout auth check running...");
    const session = localStorage.getItem(USER_SESSION_KEY);
    if (session) {
      try {
        const parsedSession: UserSessionData = JSON.parse(session);
        if (parsedSession && parsedSession.uid && parsedSession.isVerified && parsedSession.role === 'admin') {
          setCurrentUser(parsedSession);
        } else {
          // Session exists but is not a valid admin.
          router.replace('/login');
        }
      } catch (e) {
        // Corrupt session.
        localStorage.removeItem(USER_SESSION_KEY);
        router.replace('/login');
      }
    } else {
      // No session.
      router.replace('/login');
    }
    setIsAuthCheckComplete(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(USER_SESSION_KEY);
    setCurrentUser(null);
    toast({
      title: "Sesión Cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    router.push('/'); 
    router.refresh();
  };

  if (!isAuthCheckComplete || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso al panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar Rail={<SidebarRail />} collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <AppLogo className="h-7 w-auto text-primary" />
              {/* <span className="font-bold text-lg font-headline">Admin</span> */}
            </Link>
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <AdminSidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
          <div className="group-data-[collapsible=icon]:hidden flex flex-col gap-2">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
              <Link href="/">
                <ExternalLink className="h-4 w-4" /> Ver Sitio
              </Link>
            </Button>
            {/* <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <UserCircle className="h-4 w-4" /> Account
            </Button> */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleLogout} 
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
           <div className="hidden group-data-[collapsible=icon]:flex flex-col gap-2 items-center">
             <Button variant="ghost" size="icon" aria-label="Ver Sitio" asChild>
                <Link href="/">
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </Button>
             {/* <Button variant="ghost" size="icon" aria-label="Account">
                <UserCircle className="h-5 w-5" />
              </Button> */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10" 
              aria-label="Logout"
              onClick={handleLogout} 
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-2 md:p-6 flex-1 overflow-auto">
         <div className="flex items-center justify-start p-2 md:hidden sticky top-0 bg-background z-10 border-b mb-4">
            <SidebarTrigger />
            <Link href="/admin" className="ml-2">
              <AppLogo className="h-7 w-auto text-primary" />
            </Link>
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
