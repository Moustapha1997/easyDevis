
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import QuotesList from "./pages/QuotesList";
import CreateQuote from "./pages/CreateQuote";
import ClientsManagement from "./pages/ClientsManagement";
import ProductsManagement from "./pages/ProductsManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Dashboard />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/quotes" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <QuotesList />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/create-quote" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <CreateQuote />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <ClientsManagement />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <ProductsManagement />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
