
'use client'; 

import Link from 'next/link';
import Image from 'next/image'; 
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons/app-logo';
import { Menu, Radio, LogIn, LogOut as LogOutIcon, Loader2, Settings, User as UserIconLucide } from 'lucide-react'; 
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEffect, useState } from 'react'; 
import { getSetting, type LivestreamSettings, type AppearanceSettings } from '@/services/settingsService';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton'; 
import { useRouter, usePathname } from 'next/navigation'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { io, type Socket } from 'socket.io-client';


const USER_SESSION_KEY = 'onlyfansly_user_session';

interface UserSessionData {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isVerified: boolean;
  avatarUrl?: string;
}

export function Header() {
  const [livestreamSettings, setLivestreamSettings] = useState<LivestreamSettings | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSessionData | null>(null); 
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    async function fetchHeaderSettings() {
      setIsLoadingSettings(true);
      try {
        const [liveSettings, appearance] = await Promise.all([
          getSetting<LivestreamSettings>('livestream'),
          getSetting<AppearanceSettings>('appearance')
        ]);
        setLivestreamSettings(liveSettings);
        setAppearanceSettings(appearance);
      } catch (error) {
        console.error("Failed to load settings for header:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    fetchHeaderSettings();
  }, []);

  useEffect(() => {
    const socket = io({ path: '/api/socket_io' });
    
    socket.on('connect', () => {
        const session = localStorage.getItem(USER_SESSION_KEY);
        if (session) {
            const parsedSession = JSON.parse(session);
            socket.emit('client:identify', { userId: parsedSession.uid, isAdmin: parsedSession.role === 'admin' });
        } else {
            socket.emit('client:identify', { userId: null, isAdmin: false });
        }
    });

    socket.on('SETTINGS_WERE_UPDATED', (data: { type: string, settings: any }) => {
        if (data.type === 'livestream') {
            setLivestreamSettings(data.settings);
        }
    });

    return () => { 
      socket.disconnect(); 
    };

  }, [currentUser?.uid]);


  useEffect(() => {
    setIsLoadingAuth(true);
    const storedSession = localStorage.getItem(USER_SESSION_KEY);
    if (storedSession) {
      try {
        const sessionData: UserSessionData = JSON.parse(storedSession);
        setCurrentUser(sessionData);
      } catch (error) {
        console.error("Error parsing stored session in Header:", error);
        localStorage.removeItem(USER_SESSION_KEY); 
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setIsLoadingAuth(false);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === USER_SESSION_KEY) {
        const newStoredSession = event.newValue;
        if (newStoredSession) {
          try {
            setCurrentUser(JSON.parse(newStoredSession));
          } catch { setCurrentUser(null); }
        } else {
          setCurrentUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [pathname]); 

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

  const isUserLoggedIn = !!currentUser;
  const isLoading = isLoadingSettings || isLoadingAuth;

  const liveStreamVisibility = livestreamSettings?.visibility || 'disabled';
  const logoUrlToDisplay = appearanceSettings?.logoExternalUrl;

  let displayLiveButton = false;
  if (!isLoadingSettings && liveStreamVisibility !== 'disabled') {
    if (liveStreamVisibility === 'public') {
      displayLiveButton = true;
    } else if (liveStreamVisibility === 'private' && isUserLoggedIn) {
      displayLiveButton = true;
    } else if (liveStreamVisibility === 'exclusive' && isUserLoggedIn && currentUser?.uid) {
      displayLiveButton = !!livestreamSettings?.exclusiveUserIds?.includes(currentUser.uid);
    }
  }
  
  const userInitials = currentUser?.firstName && currentUser?.lastName 
    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}` 
    : currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {isLoadingSettings ? <Skeleton className="h-10 w-32" /> : 
            logoUrlToDisplay ? (
              <Image 
                src={logoUrlToDisplay} 
                alt={siteConfig.name + " Logo"} 
                width={150} 
                height={40} 
                className="h-10 object-contain" 
                style={{ width: 'auto' }} 
                priority 
                data-ai-hint="logo brand"
              />
            ) : (
              <AppLogo />
            )
          }
        </Link>
        
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
          {displayLiveButton && (
            <Button variant="default" size="sm" asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
              <Link href="/live">
                <Radio className="mr-2 h-4 w-4" />
                Live
              </Link>
            </Button>
          )}
          {isLoadingAuth ? (
            <Skeleton className="h-9 w-24 rounded-md" />
          ) : isUserLoggedIn && currentUser ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={currentUser.avatarUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser.firstName || ''} {currentUser.lastName || ''}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIconLucide className="mr-2 h-4 w-4" />
                      Mi Cuenta
                    </Link>
                  </DropdownMenuItem>
                  {currentUser.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login / Register
              </Link>
            </Button> 
          )}
        </nav>

        <div className="md:hidden flex items-center">
          {isLoadingAuth ? (
            <Skeleton className="h-9 w-9 rounded-full mr-2" />
           ) : isUserLoggedIn && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full mr-1">
                    <Avatar className="h-9 w-9">
                       <AvatarImage src={currentUser.avatarUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
                       <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser.firstName || ''} {currentUser.lastName || ''}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIconLucide className="mr-2 h-4 w-4" />
                      Mi Cuenta
                    </Link>
                  </DropdownMenuItem>
                  {currentUser.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                     <LogOutIcon className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
               <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-lg font-semibold text-primary">{siteConfig.name} Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6 p-4">
                {siteConfig.mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg transition-colors hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ))}
                {displayLiveButton && (
                  <Button variant="default" asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
                    <Link href="/live">
                      <Radio className="mr-2 h-4 w-4" />
                      Live
                    </Link>
                  </Button>
                )}
                 {!isUserLoggedIn && !isLoadingAuth && (
                  <Button variant="outline" className="w-full text-lg" asChild>
                     <Link href="/login">
                       <LogIn className="mr-2 h-4 w-4" />
                      Login / Register
                    </Link>
                  </Button> 
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
