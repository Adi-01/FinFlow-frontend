"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  UserCircle,
  LogOut,
  Wallet,
  PanelLeft,
  Eye,
  ArrowRightLeft,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { logoutAction } from "@/app/actions/auth";
import { useUserContext } from "@/components/providers/user-provider";
import { SidebarMonthPicker } from "@/components/shared/SidebarMonthPicker";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  {
    label: "Profile",
    href: "/profile",
    icon: UserCircle,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowRightLeft,
  },
  {
    label: "Income",
    href: "/income",
    icon: TrendingUp,
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: TrendingDown,
  },
  {
    label: "Reflect",
    href: "/reflect",
    icon: Sparkles,
  },
];

export function WorkspaceSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    queryClient.clear();
    await logoutAction();
    window.location.href = "/login";
  };

  useEffect(() => {
    if (!user) return;
    if (user.isOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
    } else if (!user.isOnboarding && pathname === "/onboarding") {
      router.replace("/dashboard");
    }
  }, [user, pathname, router]);

  if (pathname === "/onboarding") {
    return (
      <div className="flex h-screen w-full flex-col overflow-y-auto bg-background text-foreground">
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-border bg-background px-4 sm:px-7">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  const getPageTitle = () => {
    const activeItem = navItems.find((item) => pathname.startsWith(item.href));
    return activeItem ? activeItem.label : "Dashboard";
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <AnimatedSidebarProvider className="flex-1 h-full overflow-hidden bg-background">
        <AnimatedSidebar
          ariaLabel="FinFlow workspace navigation"
          collapsible="icon"
          className="min-h-0"
          panelClassName="h-full border-r border-border bg-sidebar"
        >
          {/* Sidebar Header Brand & Month Picker */}
          <AnimatedSidebarHeader className="p-2.5 pb-2 space-y-1.5">
            <div className="flex min-h-9 items-center gap-2.5 overflow-hidden px-2">
              <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground group-data-[state=collapsed]/sidebar:hidden">
                FinFlow
              </span>
            </div>
            <div className="px-1 mt-1">
              <SidebarMonthPicker />
            </div>
          </AnimatedSidebarHeader>

          {/* Sidebar Content Navigation */}
          <AnimatedSidebarContent className="px-2 pt-1">
            <AnimatedSidebarGroup>
              <AnimatedSidebarGroupLabel className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
                Menu
              </AnimatedSidebarGroupLabel>
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu>
                  {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive =
                      pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <AnimatedSidebarMenuItem key={href}>
                        <Link href={href} className="w-full">
                          <AnimatedSidebarMenuButton
                            isActive={isActive}
                            icon={<Icon className="size-4" />}
                          >
                            {label}
                          </AnimatedSidebarMenuButton>
                        </Link>
                      </AnimatedSidebarMenuItem>
                    );
                  })}
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>
          </AnimatedSidebarContent>

          {/* Sidebar Footer User Info & Logout */}
          <AnimatedSidebarFooter className="gap-2 border-t border-border p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden rounded-md p-1">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name || "User"}
                  className="size-8 shrink-0 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-black/5 dark:bg-white/10 text-xs font-semibold text-foreground">
                  {user ? user.name.substring(0, 2) : "FF"}
                </div>
              )}
              <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
                <span className="block truncate text-xs font-medium text-foreground">
                  {user?.name || "Financial User"}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-data-[state=collapsed]/sidebar:hidden"
                title="Sign Out"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </AnimatedSidebarFooter>

          <AnimatedSidebarRail />
        </AnimatedSidebar>

        {/* Main Content Area */}
        <AnimatedSidebarInset className="flex min-h-0 flex-1 flex-col bg-background">
          {/* Top Bar Header */}
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <AnimatedSidebarTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-foreground">
                <PanelLeft className="size-4" />
              </AnimatedSidebarTrigger>
              <ChevronRight className="h-4"/>
              <h2 className="text-sm font-normal text-foreground">
                {getPageTitle()}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          {/* Dynamic Page Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        </AnimatedSidebarInset>
      </AnimatedSidebarProvider>
    </div>
  );
}
