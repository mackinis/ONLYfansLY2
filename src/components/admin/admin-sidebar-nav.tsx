"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/site";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import React from "react";

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {siteConfig.adminNav.map((item, index) => (
        <React.Fragment key={index}>
          {item.subItems && item.subItems.length > 0 ? (
            <SidebarMenuItem>
               <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`} className="border-none">
                  <AccordionTrigger className="w-full hover:no-underline p-2 rounded-md hover:bg-sidebar-accent [&[data-state=open]>svg]:text-primary">
                    <SidebarMenuButton
                      asChild
                      isActive={item.subItems.some(sub => pathname.startsWith(sub.href))}
                      className="w-full justify-start p-0 h-auto bg-transparent hover:bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-sidebar-primary"
                    >
                      <span> {/* Needs a span or div for asChild to work correctly with SidebarMenuButton structure */}
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <SidebarMenuSub>
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.href}>
                          <SidebarMenuSubButton
                            href={subItem.href}
                            isActive={pathname === subItem.href || pathname.startsWith(subItem.href + "/")}
                            asChild
                          >
                            <Link href={subItem.href}>
                              {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                href={item.href}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                asChild
              >
                <Link href={item.href}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </React.Fragment>
      ))}
    </SidebarMenu>
  );
}
