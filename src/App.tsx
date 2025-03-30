
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Bandi from "./pages/Bandi";
import DettaglioBando from "./pages/DettaglioBando";
import Clienti from "./pages/Clienti";
import NuovoCliente from "./pages/NuovoCliente";
import DettaglioCliente from "./pages/DettaglioCliente";
import Match from "./pages/Match";
import Report from "./pages/Report";
import Fonti from "./pages/Fonti";
import ImportaBandi from './pages/ImportaBandi';
import NotFound from "./pages/NotFound";
import AdminSettings from "./pages/AdminSettings";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bandi" element={<Bandi />} />
              <Route path="bandi/:id" element={<DettaglioBando />} />
              <Route path="clienti" element={<Clienti />} />
              <Route path="clienti/nuovo" element={<NuovoCliente />} />
              <Route path="clienti/:id" element={<DettaglioCliente />} />
              <Route path="match" element={<Match />} />
              <Route path="report" element={<Report />} />
              <Route path="fonti" element={<Fonti />} />
              <Route path="importa-bandi" element={<ImportaBandi />} />
              <Route path="admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="admin/gestione" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPage />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
