import { useTheme } from "@/contexts/ThemeContext";
import LogotypeBlack from "@/assets/logotype - black.svg";
import LogotypeWhite from "@/assets/logotype - white.svg";

export const SplashScreen = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <img
        src={theme === "dark" ? LogotypeWhite : LogotypeBlack}
        alt="Logotype"
        className="h-24 w-auto animate-pulse"
      />
    </div>
  );
};
