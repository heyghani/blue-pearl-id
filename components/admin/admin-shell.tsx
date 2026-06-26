"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavLink({
  href,
  label,
  icon: Icon,
  exact,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, href, exact);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-pearl text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

function AdminNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)}>
      {adminNavItems.map((item) => (
        <AdminNavLink key={item.href} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function AdminUserFooter({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  return (
    <div className="border-t pt-4">
      <div className="mb-3 rounded-lg bg-muted/60 px-3 py-2.5">
        <p className="truncate text-sm font-medium">{name ?? "Admin"}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 text-muted-foreground"
          asChild
        >
          <Link href="/">
            <ExternalLink className="h-4 w-4" />
            View storefront
          </Link>
        </Button>
        <SignOutButton
          className="w-full justify-start gap-3 px-3 text-muted-foreground"
          icon={<LogOut className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card/80 p-5 md:flex">
        <div className="mb-8 px-1">
          <Link href="/admin" className="block">
            <p className="font-display text-xl font-semibold tracking-tight">
              {APP_NAME}
            </p>
            <p className="text-xs text-muted-foreground">Administration</p>
          </Link>
        </div>

        <AdminNav className="flex-1" />
        <AdminUserFooter name={user.name} email={user.email} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:hidden">
          <Drawer open={mobileOpen} onOpenChange={setMobileOpen} direction="left">
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open admin menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-0">
              <DrawerHeader className="border-b px-5 py-4 text-left">
                <DrawerTitle className="font-display text-lg">
                  {APP_NAME}
                </DrawerTitle>
                <p className="text-xs text-muted-foreground">Administration</p>
              </DrawerHeader>
              <div className="flex flex-1 flex-col px-4 py-4">
                <AdminNav onNavigate={() => setMobileOpen(false)} />
                <div className="mt-auto">
                  <AdminUserFooter name={user.name} email={user.email} />
                </div>
              </div>
              <DrawerClose className="sr-only">Close</DrawerClose>
            </DrawerContent>
          </Drawer>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name ?? "Admin"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
