import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, BookOpen, Youtube, Video, GalleryVerticalEnd, Smartphone, DollarSign, Languages, MessageSquare, Settings, SlidersHorizontal, Palette, UserCog, Apple, Play, Home, Info, FileText, Users as UsersIcon, Mail, Facebook, Twitter, Instagram, Radio, Edit3, Share2, MessageCircle as MessageCircleIcon, Linkedin // Renamed to avoid conflict
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
  subItems?: NavItem[];
};

export interface SocialMediaLinkConfig {
  platform: string; 
  href: string; 
  icon: LucideIcon | string; 
}


export const siteConfig = {
  name: "ONLYfansLY",
  description: "Tu universo de contenido exclusivo e interacción. Personaliza encabezado, banner principal, textos, colores y tamaños a través del panel de administración.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://onlyfansly.example.com",
  mainNav: [
    { title: "Inicio", href: "/", icon: Home },
    { title: "Cursos", href: "/#courses", icon: BookOpen },
    { title: "Historias", href: "/#stories", icon: UsersIcon }, 
    { title: "Contacto", href: "/contact", icon: Mail },   
  ] satisfies NavItem[],
  footerNav: [ 
    { title: "Sobre Nosotros", href: "/about", icon: Info },
    { title: "Política de Privacidad", href: "/privacy", icon: FileText },
    { title: "Términos de Servicio", href: "/terms", icon: FileText },
  ] satisfies NavItem[],
  socialLinks: [
    { platform: "Facebook", href: "https://facebook.com/onlyfansly", icon: Facebook },
    { platform: "X", href: "https://x.com/onlyfansly", icon: Twitter },
    { platform: "Instagram", href: "https://instagram.com/onlyfansly", icon: Instagram },
    { platform: "YouTube", href: "https://youtube.com/onlyfansly", icon: Youtube },
  ] satisfies SocialMediaLinkConfig[],
  adminNav: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Cursos", href: "/admin/courses", icon: BookOpen },
    { title: "Popups", href: "/admin/popups", icon: MessageSquare, description: "Crea y gestiona popups para la página de inicio." },
    { title: "Livestream", href: "/admin/livestream", icon: Youtube },
    { title: "Historias", href: "/admin/stories", icon: GalleryVerticalEnd, description: "Gestiona las historias enviadas por los usuarios: aprueba, rechaza, establece límites de tiempo de edición y configura los ajustes de envío." },
    { title: "App Mobiles", href: "/admin/appmobiles", icon: Smartphone },
    { title: "Dinero", href: "/admin/money", icon: DollarSign, description: "Configura las opciones de moneda para los precios de los cursos." },
    { title: "Usuarios", href: "/admin/users", icon: UsersIcon, description: "Gestionar cuentas de usuario y permisos." },
    { title: "Idiomas", href: "/admin/languages", icon: Languages },
    { title: "Redes Sociales", href: "/admin/social", icon: Share2, description: "Configura los enlaces a tus perfiles de redes sociales." },
    { title: "WhatsApp Chat", href: "/admin/whatsapp", icon: MessageCircleIcon, description: "Configura los ajustes del widget de chat de WhatsApp." },
    {
      title: "Configuración",
      icon: Settings,
      href: "/admin/configuration", 
      subItems: [
        { title: "General", href: "/admin/configuration/general", icon: SlidersHorizontal },
        { title: "Apariencia", href: "/admin/configuration/appearance", icon: Palette },
        { title: "Cuenta Admin", href: "/admin/configuration/account", icon: UserCog },
      ],
    },
  ] satisfies NavItem[],
  appDownloadLinks: { 
    android: {
      url: process.env.NEXT_PUBLIC_ANDROID_APP_URL || "https://play.google.com/store/apps/details?id=com.example.onlyfansly", 
      icon: Play, 
      brand: process.env.NEXT_PUBLIC_ANDROID_APP_BRAND || "Google Play"
    },
    ios: {
      url: process.env.NEXT_PUBLIC_IOS_APP_URL || "https://apps.apple.com/app/onlyfansly-app/id123456789", 
      icon: Apple, 
      brand: process.env.NEXT_PUBLIC_IOS_APP_BRAND || "App Store"
    }
  },
  defaultHero: {
    mainText: "Bienvenido a ONLYfansLY",
    secondaryText: "Tu Universo de Contenido",
    descriptionText: "Descubre creadores increíbles, cursos exclusivos y streams en vivo.",
    mainTextColor: "#FFFFFF",
    heroImageUrl: "",
  },
  defaultCourseImage: "https://placehold.co/600x400.png",
  defaultLiveStreamUrl: "https://www.youtube.com/embed/live_stream?channel=UC-lHJZR3Gqxm24_Vd_AJ5Yw", 
};

export type SiteConfig = typeof siteConfig;
