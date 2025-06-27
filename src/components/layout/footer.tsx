
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { AppLogo } from '@/components/icons/app-logo';
import { Button } from '@/components/ui/button';
import type { GeneralSettings, LivestreamSettings, StorySettings, AppearanceSettings, SocialMediaSettings, SocialMediaLink, AppMobilesSettings } from '@/services/settingsService'; 
import { getSetting } from '@/services/settingsService';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users, Mail, Radio, Edit3, LogIn, Apple, Play, Facebook, Twitter, Instagram, Linkedin, Youtube as YoutubeIcon, type LucideIcon } from 'lucide-react'; 
import { StorySubmissionForm } from '@/components/forms/story-submission-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, usePathname } from 'next/navigation';

const USER_SESSION_KEY = 'onlyfansly_user_session';

interface UserSessionData {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isVerified: boolean;
}

const platformIcons: { [key: string]: LucideIcon } = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: YoutubeIcon,
};

export function Footer() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [livestreamSettings, setLivestreamSettings] = useState<LivestreamSettings | null>(null);
  const [storySettings, setStorySettings] = useState<StorySettings | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null);
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings | null>(null);
  const [appMobilesSettings, setAppMobilesSettings] = useState<AppMobilesSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchFooterSettings() {
      setIsLoading(true); 
      try {
        const [genSettings, liveSettings, strySettings, appSettings, socialSettings, mobileSettings] = await Promise.all([
          getSetting<GeneralSettings>('general'),
          getSetting<LivestreamSettings>('livestream'),
          getSetting<StorySettings>('stories'),
          getSetting<AppearanceSettings>('appearance'),
          getSetting<SocialMediaSettings>('social_media'), 
          getSetting<AppMobilesSettings>('app_mobiles'),
        ]);
        setGeneralSettings(genSettings);
        setLivestreamSettings(liveSettings);
        setStorySettings(strySettings);
        setAppearanceSettings(appSettings);
        setSocialMediaSettings(socialSettings);
        setAppMobilesSettings(mobileSettings);
      } catch (error) {
        console.error("Failed to load settings for footer:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFooterSettings();
  }, []);


  useEffect(() => {
    const storedSession = localStorage.getItem(USER_SESSION_KEY);
    if (storedSession) {
      try {
        const sessionData: UserSessionData = JSON.parse(storedSession);
        setCurrentUser(sessionData);
      } catch (error) {
        console.error("Error parsing stored session in Footer:", error);
        localStorage.removeItem(USER_SESSION_KEY);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

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


  const isUserLoggedIn = !!currentUser;

  const showLogoInFooter = appearanceSettings?.showLogoFooter === undefined ? true : appearanceSettings.showLogoFooter;
  const showBrandNameInFooter = appearanceSettings?.showBrandNameFooter === undefined ? false : appearanceSettings.showBrandNameFooter;
  const brandNameForFooter = appearanceSettings?.brandNameFooter || generalSettings?.siteName || siteConfig.name;
  const logoUrlToDisplayInFooter = appearanceSettings?.logoExternalUrl;

  const canUserSubmitStory = storySettings?.allowUserSubmission === undefined ? true : storySettings.allowUserSubmission;

  const socialLinksToDisplay: SocialMediaLink[] = socialMediaSettings?.links?.filter(link => link.platform && link.url).length ? socialMediaSettings.links.filter(link => link.platform && link.url) : siteConfig.socialLinks.map(sl => ({ platform: sl.platform, url: sl.href }));
  
  const iosLink = appMobilesSettings?.iosUrl || siteConfig.appDownloadLinks.ios.url;
  const iosBrand = appMobilesSettings?.iosBrand || siteConfig.appDownloadLinks.ios.brand;
  const iosIconUrl = appMobilesSettings?.iosIconUrl;
  const DefaultIosIcon = siteConfig.appDownloadLinks.ios.icon;
  
  const androidLink = appMobilesSettings?.androidUrl || siteConfig.appDownloadLinks.android.url;
  const androidBrand = appMobilesSettings?.androidBrand || siteConfig.appDownloadLinks.android.brand;
  const androidIconUrl = appMobilesSettings?.androidIconUrl;
  const DefaultAndroidIcon = siteConfig.appDownloadLinks.android.icon;


  if (isLoading) {
    return (
      <footer className="border-t border-border py-12 bg-card text-card-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-8">
            <div className="flex flex-col items-center justify-start space-y-3 text-center md:items-start md:text-left md:justify-start h-full">
              <Skeleton className="h-16 w-32 mb-2" /> 
              <Skeleton className="h-4 w-48" /> 
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-20 mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div>
              <Skeleton className="h-5 w-28 mb-3" />
              <Skeleton className="h-10 w-full rounded-md mb-3" />
              <div className="flex space-x-3 justify-center md:justify-start">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
            </div>
            <div className="flex flex-col items-stretch space-y-2">
              <Skeleton className="h-5 w-28 mb-3" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
           <div className="text-center text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border py-12 bg-card text-card-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-10 mb-8">
          {/* Column 1: Logo */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center h-full">
            {showLogoInFooter && (
              <Link href="/" className="mb-0">
                {logoUrlToDisplayInFooter ? (
                  <Image 
                    src={logoUrlToDisplayInFooter} 
                    alt={`${brandNameForFooter} Logo`} 
                    width={180} 
                    height={72} 
                    className="h-20 object-contain" 
                    style={{ width: 'auto' }} 
                    data-ai-hint="logo brand"
                  />
                ) : (
                  <AppLogo className="h-20 w-auto text-primary" />
                )}
              </Link>
            )}
            {showBrandNameInFooter && <p className="text-sm text-muted-foreground -mt-2">{brandNameForFooter}</p>}
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Links Rápidos</h3>
            <ul className="space-y-2">
              {siteConfig.footerNav.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.icon && <link.icon size={16} className="inline mr-1.5 relative -top-px"/>} {link.title} 
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Explorar</h3>
            <ul className="space-y-2">
                <li><Link href="/#courses" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5"><BookOpen size={16}/> Cursos</Link></li>
                <li><Link href="/#stories" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5"><Users size={16}/> Historias</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5"><Mail size={16}/> Contacto</Link></li>
            </ul>
          </div>
          
          {/* Column 4: Historias y Redes */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Historias y Redes</h3>
            {canUserSubmitStory && (
              <Dialog open={isStoryModalOpen} onOpenChange={setIsStoryModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 mb-4"
                  >
                    <Edit3 className="mr-2 h-4 w-4" /> ¡Conta la tuya!
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                   <DialogHeader>
                    <DialogTitle className="font-headline text-primary">
                      {isUserLoggedIn ? "Crea una Nueva Historia" : "Acceso Requerido"}
                    </DialogTitle>
                  </DialogHeader>
                  {isUserLoggedIn ? (
                    <>
                    <DialogDescription>
                      Comparte tu momento con la comunidad. Sube una imagen o un video (URL o iframe).
                    </DialogDescription>
                    <StorySubmissionForm onSuccess={() => setIsStoryModalOpen(false)} />
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground mb-4">
                        Debes <Button variant="link" className="p-0 h-auto" asChild><Link href="/login">iniciar sesión</Link></Button> o <Button variant="link" className="p-0 h-auto" asChild><Link href="/register">registrarte</Link></Button> para crear una historia.
                      </p>
                       <Button asChild className="w-full">
                        <Link href="/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Iniciar Sesión / Registrarse
                        </Link>
                       </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
            {!canUserSubmitStory && (
              <p className="text-sm text-muted-foreground mb-4">
                La subida de historias está actualmente desactivada.
              </p>
            )}
            {/* Social Links Moved Here */}
            {socialLinksToDisplay && socialLinksToDisplay.length > 0 && (
              <div className="flex space-x-3 pt-2 justify-center md:justify-start">
                {socialLinksToDisplay.map((link) => {
                  const IconComponent = platformIcons[link.platform.toLowerCase()];
                  return (
                    <Button 
                      key={link.platform} 
                      variant="ghost" 
                      size="icon" 
                      asChild
                      className="text-muted-foreground hover:text-primary"
                      aria-label={link.platform}
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {IconComponent ? <IconComponent className="h-5 w-5" /> : <span className="text-xs">{link.platform.substring(0,2)}</span>}
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 5: Download App */}
          <div className="flex flex-col items-start space-y-2">
             <h3 className="font-semibold mb-1 text-foreground">Descarga la App</h3>
              {iosLink && (
                <Button asChild variant="outline" className="min-w-[180px] w-auto justify-start text-foreground hover:bg-accent hover:text-accent-foreground border-input self-start">
                  <a href={iosLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    {iosIconUrl ? (
                      <Image src={iosIconUrl} alt={`${iosBrand || 'iOS'} icon`} width={20} height={20} className="mr-2 h-5 w-5 object-contain" />
                    ) : DefaultIosIcon ? (
                      <DefaultIosIcon className="mr-2 h-5 w-5" />
                    ) : null}
                    {iosBrand || 'App Store'}
                  </a>
                </Button>
              )}
              {androidLink && (
                <Button asChild variant="outline" className="min-w-[180px] w-auto justify-start text-foreground hover:bg-accent hover:text-accent-foreground border-input self-start">
                  <a href={androidLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                     {androidIconUrl ? (
                      <Image src={androidIconUrl} alt={`${androidBrand || 'Android'} icon`} width={20} height={20} className="mr-2 h-5 w-5 object-contain" />
                    ) : DefaultAndroidIcon ? (
                      <DefaultAndroidIcon className="mr-2 h-5 w-5" />
                    ) : null}
                    {androidBrand || 'Google Play'}
                  </a>
                </Button>
              )}
            </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
          &copy; {new Date().getFullYear()} {brandNameForFooter}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
