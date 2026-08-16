import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/common/components/ui/sonner";
import { Toaster } from "@/common/components/ui/toaster";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { AuthProvider } from "@/common/contexts/AuthContext";
import { DomainProvider } from "@/common/contexts/DomainContext";
import { ThemeProvider } from "@/common/contexts/ThemeContext";
import { AppRoutes } from "@/routes/AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <DomainProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="bottom-right" />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </DomainProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
