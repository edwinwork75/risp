import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import Index from "./pages/Index";
import FormBuilder from "./pages/form-builder";
import FormPreview from "./pages/form-builder/preview";
import NotFound from "./pages/NotFound";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const shouldRenderHeaderAndSidebar = location.pathname !== "/form-builder" && location.pathname !== "/form-preview";

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col w-full">
        {shouldRenderHeaderAndSidebar && <AppHeader />}
        <main className="flex-1 w-full">
          {/* {shouldRenderHeaderAndSidebar && <AppSidebar />} */}

          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/form-builder" element={<FormBuilder />} />
            <Route path="/form-preview" element={<FormPreview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>

    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);


export default App;
