
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
            {/* Redirect from root to login page */}
            <Route path="/" element={<Index />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={
                <ProtectedRoute clientOnly={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="bandi" element={
                <ProtectedRoute clientOnly={true}>
                  <Bandi />
                </ProtectedRoute>
              } />
              <Route path="bandi/:id" element={
                <ProtectedRoute clientOnly={true}>
                  <DettaglioBando />
                </ProtectedRoute>
              } />
              <Route path="clienti" element={
                <ProtectedRoute clientOnly={true}>
                  <Clienti />
                </ProtectedRoute>
              } />
              <Route path="clienti/nuovo" element={
                <ProtectedRoute clientOnly={true}>
                  <NuovoCliente />
                </ProtectedRoute>
              } />
              <Route path="clienti/:id" element={
                <ProtectedRoute clientOnly={true}>
                  <DettaglioCliente />
                </ProtectedRoute>
              } />
              <Route path="match" element={
                <ProtectedRoute clientOnly={true}>
                  <Match />
                </ProtectedRoute>
              } />
              <Route path="report" element={
                <ProtectedRoute clientOnly={true}>
                  <Report />
                </ProtectedRoute>
              } />
              <Route path="fonti" element={
                <ProtectedRoute clientOnly={true}>
                  <Fonti />
                </ProtectedRoute>
              } />
              <Route path="importa-bandi" element={
                <ProtectedRoute clientOnly={true}>
                  <ImportaBandi />
                </ProtectedRoute>
              } />
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
