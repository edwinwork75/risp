"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  FolderKanban,
  UserCircle,
  Shield,
  ChevronRight,
  ChevronLeft,
  User,
  Building2,
  Users,
  ShieldHalf,
  LogOut,
  Settings,
  ToggleLeft,
  ToggleRight,
  FileText,
  ClipboardList,
  Group,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedComponent } from "@/components/rbac/ProtectedComponent";
import { mcApiService } from "@/lib/mcApiService";

// Define navigation items for different contexts
const adminSidebarItems = [
  {
    title: "Organizations",
    href: "/admin/organisations",
    icon: Building2,
    requiredSystemRole: ["SUPER_USER", "ORG_ADMIN"]
  },
  {
    title: "Questionnaires",
    href: "/admin/questionnaires",
    icon: FileText,
    requiredSystemRole: ["SUPER_USER"],
    dynamic: false
  },
  // {
  //   title: "Actions",
  //   href: "/admin/actions",
  //   icon: ShieldHalf,
  //   requiredSystemRole: ["SUPER_USER"],
  //   dynamic: false
  // },
  {
    title: "Dashboard",
    href: "/admin/[orgId]/dashboard",
    icon: LayoutDashboard,
    requiredSystemRole: ["SUPER_USER", "ORG_ADMIN"],
    dynamic: true
  },
  {
    title: "Projects",
    href: "/admin/[orgId]/projects",
    icon: FolderKanban,
    requiredSystemRole: ["SUPER_USER", "ORG_ADMIN"],
    dynamic: true
  },
  {
    title: "Users",
    href: "/admin/[orgId]/users",
    icon: Users,
    requiredSystemRole: ["SUPER_USER", "ORG_ADMIN"],
    dynamic: true
  },
  {
    title: "Roles",
    href: "/admin/[orgId]/roles",
    icon: UserCircle,
    requiredSystemRole: ["SUPER_USER", "ORG_ADMIN"],
    dynamic: true
  },
  {
    title: "Permissions",
    href: "/admin/[orgId]/permissions",
    icon: Shield,
    requiredSystemRole: ["SUPER_USER", "ORG_ADMIN"],
    dynamic: true
  },
] as const;

const appSidebarItems = [
  {
    title: "Projects",
    href: "/app/projects",
    icon: FolderKanban,
    // No permission required - always show Projects listing in app context
  },
  {
    title: "Dashboard",
    href: "/app/[projectId]/dashboard",
    icon: LayoutDashboard,
    requiredPermissions: ["project.read"],
    dynamic: true
  },
  {
    title: "Users",
    href: "/app/[projectId]/users",
    icon: Users,
    requiredPermissions: ["users.read"],
    dynamic: true
  },
  {
    title: "User Groups",
    href: "/app/[projectId]/usergroups",
    icon: Group,
    requiredPermissions: ["groups.read"],
    dynamic: true
  },
  {
    title: "Assessments",
    href: "/app/[projectId]/assessments",
    icon: FileText,
    requiredPermissions: ["assessments.read"],
    dynamic: true
  },
  {
    title: "Assignments",
    href: "/app/[projectId]/assignments",
    icon: ClipboardList,
    requiredPermissions: ["assignments.read"],
    dynamic: true
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Add hydration check to prevent SSR mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  // Use new TanStack Query-based auth hook
  const { 
    user,
    isAuthenticated,
    organizations,
    isSuperAdmin,
    isOrgAdmin,
    canSwitchContext,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasSystemRole,
    loading,
  } = useAuth();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentContext, setCurrentContext] = useState<"admin" | "app">("admin");
  const [currentProjectOrg, setCurrentProjectOrg] = useState<string | null>(null);

  // Check if component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
    // Load saved context from localStorage
    const savedContext = localStorage.getItem('nallahealth-context');
    if (savedContext === 'app' || savedContext === 'admin') {
      setCurrentContext(savedContext);
    }
  }, []);

  // Context detection
  useEffect(() => {
    if (!isMounted) return;
    detectCurrentContext();
  }, [pathname, isMounted]);

  // Fetch project organization when projectId changes
  useEffect(() => {
    if (!isMounted || loading || !organizations.length) return;
    
    if (params.projectId && currentContext === 'app') {
      fetchProjectOrganization(params.projectId as string);
    } else {
      setCurrentProjectOrg(null);
    }
  }, [params.projectId, currentContext, isMounted, loading, organizations]);

  const detectCurrentContext = () => {
    // Don't change context when on profile page - maintain current context
    if (pathname === '/profile') {
      return;
    }
    
    if (pathname.startsWith('/app')) {
      setCurrentContext('app');
      localStorage.setItem('nallahealth-context', 'app');
    } else if (pathname.startsWith('/admin')) {
      setCurrentContext('admin');
      localStorage.setItem('nallahealth-context', 'admin');
    }
    // For other routes (like root), maintain current context
  };

  const fetchProjectOrganization = async (projectId: string) => {
    try {
      // First try to find the organization from cached organizations and their projects
      for (const org of organizations) {
        try {
          const response = await mcApiService.get(`/organisations/${org.id}/projects`);
          const projects = response.projects || [];
          const project = projects.find((p: any) => p.id === projectId);
          if (project) {
            setCurrentProjectOrg(org.id);
            return;
          }
        } catch (error) {
          // Continue to next organization if this one fails
          continue;
        }
      }
      setCurrentProjectOrg(null);
    } catch (error) {
      console.error('Error fetching project organization:', error);
      setCurrentProjectOrg(null);
    }
  };

  const getCurrentOrgId = () => {
    if (currentContext === 'admin') {
      return params.orgId as string || undefined;
    } else if (currentContext === 'app') {
      return currentProjectOrg || undefined;
    }
    return undefined;
  };  const getCurrentNavItems = () => {
    const baseItems = currentContext === 'admin' ? adminSidebarItems : appSidebarItems;
    
    // Filter items based on context and available parameters
    return baseItems.filter(item => {
      // Always show non-dynamic items (like Organizations and Projects listing pages)
      if (!('dynamic' in item) || !item.dynamic) {
        return true;
      }
      
      // For admin context, only show dynamic items if we have an orgId
      if (currentContext === 'admin') {
        return params.orgId !== undefined;
      }
      
      // For app context, show dynamic items if:
      // 1. We have a projectId (active project selected)
      // 2. OR if user has access to any organization (show items but they'll be disabled/inactive)
      if (currentContext === 'app') {
        return params.projectId !== undefined || organizations.length > 0;
      }
      
      return false;
    });
  };

  const buildHref = (item: any) => {
    if (!item.dynamic) return item.href;

    // Replace dynamic segments with actual values
    let href = item.href;
    
    if (currentContext === 'admin' && params.orgId) {
      href = href.replace('[orgId]', params.orgId as string);
    } else if (currentContext === 'app' && params.projectId) {
      href = href.replace('[projectId]', params.projectId as string);
    } else if (item.dynamic) {
      // If we're on a context route but don't have the required param, 
      // link to the parent listing page
      if (currentContext === 'admin') {
        return '/admin/organisations';
      } else if (currentContext === 'app') {
        return '/app/projects';
      }
    }
    
    return href;
  };

  const handleContextSwitch = (context: 'admin' | 'app') => {
    if (context === 'admin') {
      router.push('/admin/organisations');
    } else {
      router.push('/app/projects');
    }
  };
  const handleLogout = () => {
    logout();
  };

  const handleSidebarCollapse = (collapse: boolean) => {
    setIsCollapsed(collapse);
  };

  // Prevent rendering until mounted and auth is ready
  if (!isMounted || loading) {
    return (
      <aside className="fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-background_cream border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header with Context Switcher */}
        <div className="flex items-center justify-between px-4 py-4 border-b-sunny_yellow border-b">
          {!isCollapsed ? (
            <>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold whitespace-nowrap">NallaHealth Console</h1>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground capitalize">{currentContext} Console</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSidebarCollapse(true)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="mx-auto"
              onClick={() => handleSidebarCollapse(false)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Organization/Project Selector (Context-Dependent) */}
        {/* 
        <div className="px-4 py-3 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-full py-3 text-sm",
                  isCollapsed ? "justify-center px-0" : "px-4"
                )}
              >
                <Building2 className="h-5 w-5" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 truncate">
                      {currentOrgName}
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4 rotate-90" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl" align="start">
              <DropdownMenuLabel>
                Switch Organization
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleTeamChange(org)}
                  className="rounded-md"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{org.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        */}

        {/* Dynamic Navigation Items */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {getCurrentNavItems().map((item) => (
              <ProtectedComponent
                key={item.href}
                requiredPermission={(item as any).requiredPermission}
                requiredPermissions={(item as any).requiredPermissions}
                requiredSystemRole={(item as any).requiredSystemRole}
                requireAll={false}
                orgId={getCurrentOrgId()}
              >
                <Button
                  variant={pathname === buildHref(item) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start rounded-full py-3 text-sm hover:bg-sunny_yellow/90 transition",
                    pathname === buildHref(item) ? "bg-sunny_yellow" : "",
                    isCollapsed ? "justify-center px-0" : "px-4",
                    // Disable button if no project selected in app context and item is dynamic
                    currentContext === 'app' && !params.projectId && (item as any).dynamic ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  onClick={() => {
                    // Only allow navigation if not disabled
                    if (currentContext === 'app' && !params.projectId && (item as any).dynamic) {
                      return;
                    }
                    router.push(buildHref(item));
                  }}
                  disabled={currentContext === 'app' && !params.projectId && (item as any).dynamic}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">{item.title}</span>}
                </Button>
              </ProtectedComponent>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer / Account */}
        <div className="px-4 py-3 border-b-sunny_yellow border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className={cn(
                  "w-full justify-start rounded-full py-3 bg-sunny_yellow hover:bg-sunny_yellow/90 text-sm",
                  isCollapsed ? "justify-center px-0" : "px-4"
                )}
              >
                <User className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">Account</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Console Switching Section */}
              {canSwitchContext && (
                <>
                  <div className="px-2 py-1">
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 hover:bg-background"
                        onClick={() => handleContextSwitch(currentContext === 'admin' ? 'app' : 'admin')}
                      >
                        <ArrowRightLeft className="w-3 h-3 mr-1" />
                        <span className="text-xs">
                          Switch to {currentContext === 'admin' ? 'Projects' : 'Admin'}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                </>              )}              <DropdownMenuItem onClick={() => {
                // Route to unified profile page
                router.push('/profile');
              }}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}