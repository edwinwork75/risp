"use client";

import { ClipboardCheck, Home, Activity, History, LayoutGrid, Table as TableIcon, Menu, PanelLeft, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  showProgress?: boolean;
  progress?: number;
  showViewToggle?: boolean;
  viewMode?: 'card' | 'table';
  onViewModeChange?: (mode: 'card' | 'table') => void;
  onHistoryClick?: () => void;
  onMenuClick?: () => void;
  onExportClick?: () => void;
}

export default function FormHeader({
  showProgress = true,
  progress = 0,
  showViewToggle = false,
  viewMode = 'card',
  onViewModeChange,
  onHistoryClick,
  onMenuClick,
  onExportClick
}: FormHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2 md:gap-4">

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sections Menu Trigger */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="text-muted-foreground hover:text-foreground shrink-0 lg:hidden"
              aria-label="Open Sections"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Logo and Title */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => router.push("/")}
          >
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300 ease-out shadow-sm">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none group-hover:text-primary transition-colors duration-300">
                RISP
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                Inspection
              </p>
            </div>
          </div>
        </div>

        {/* Center Progress Section - Hidden on very small screens, central on larger */}
        {showProgress && (
          <div className="flex-1 max-w-sm mx-auto hidden lg:flex flex-col gap-1.5 opacity-0 animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-between items-center text-xs font-medium text-muted-foreground px-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-primary" />
                Overall Progress
              </span>
              <span className="text-foreground font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 w-full rounded-full transition-all bg-secondary/50" />
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onExportClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportClick}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-full h-9 w-9 p-0 sm:w-auto sm:px-3 sm:h-9 mr-1"
              title="Export to Excel"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline font-medium">Export</span>
            </Button>
          )}

          {showViewToggle && onViewModeChange && (
            <div className="flex bg-secondary/50 p-1 rounded-lg border border-border/50 mr-1 sm:mr-2">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && onViewModeChange(v as 'card' | 'table')}
                className="gap-0"
              >
                <ToggleGroupItem
                  value="card"
                  aria-label="Card View"
                  size="sm"
                  className="px-2 py-1.5 h-8 w-8 sm:w-auto data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm rounded-md transition-all text-muted-foreground"
                >
                  <LayoutGrid className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline text-xs font-medium">Card</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="table"
                  aria-label="Table View"
                  size="sm"
                  className="px-2 py-1.5 h-8 w-8 sm:w-auto data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm rounded-md transition-all text-muted-foreground"
                >
                  <TableIcon className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline text-xs font-medium">Excel</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onHistoryClick}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-full h-9 w-9 p-0 sm:w-auto sm:px-3 sm:h-9"
            title="View History"
          >
            <History className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline font-medium">History</span>
          </Button>
        </div>
      </div>

      {/* Mobile progress bar (only visible on small screens) */}
      {showProgress && (
        <div className="lg:hidden w-full absolute bottom-0 left-0 bg-secondary/50 h-1">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </header>
  );
}