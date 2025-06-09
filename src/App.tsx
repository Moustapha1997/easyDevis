
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <SidebarProvider>
              <Dashboard />
            </SidebarProvider>
          } />
          <Route path="/quotes" element={
            <SidebarProvider>
              <QuotesList />
            </SidebarProvider>
          } />
          <Route path="/create-quote" element={
            <SidebarProvider>
              <CreateQuote />
            </SidebarProvider>
          } />
          <Route path="/clients" element={
            <SidebarProvider>
              <ClientsManagement />
            </SidebarProvider>
          } />
          <Route path="/products" element={
            <SidebarProvider>
              <ProductsManagement />
            </SidebarProvider>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
