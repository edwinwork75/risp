import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import LogotypeBlack from "@/assets/logotype - black.svg";
import LogotypeWhite from "@/assets/logotype - white.svg";

export const AppHeader = () => {
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-border flex items-center justify-between px-4 bg-background">
      <div className="flex items-center gap-2">
        {/* <SidebarTrigger className="md:hidden" /> */}
        <img
          src={theme === "dark" ? LogotypeWhite : LogotypeBlack}
          alt="Logotype"
          className="h-16 w-auto"
        />
      </div>
      <ThemeToggle />
    </header>
  );
};
