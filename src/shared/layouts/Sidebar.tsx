import React from 'react';
import {
  SidebarProvider as ShadcnSidebarProvider,
  SidebarInset,
  SidebarTrigger
} from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/shared/components/ui/breadcrumb";
import { SidebarProvider } from '@/shared/contexts/SidebarContext';
import { SidebarComponent } from '@/shared/components/SidebarComponent';

interface SidebarLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'patient' | 'doctor' | 'pharmacist';
  breadcrumbs?: Array<{ label: string; href?: string }>;
  title?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  role,
  breadcrumbs = [],
  title
}) => {
  return (
    <SidebarProvider role={role}>
      <ShadcnSidebarProvider defaultOpen={true}>
        <SidebarComponent />
        <SidebarInset>
          {/* Top Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem className="hidden md:block">
                        {crumb.href ? (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            {title && (
              <div className="ml-auto">
                <h1 className="text-lg font-semibold">{title}</h1>
              </div>
            )}
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 min-h-0">
            {children}
          </main>
        </SidebarInset>
      </ShadcnSidebarProvider>
    </SidebarProvider>
  );
};
