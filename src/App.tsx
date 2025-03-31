import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';

import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from './pages/Index';
import Fonti from './pages/Fonti';
import Clienti from './pages/Clienti';
import NuovoCliente from './pages/NuovoCliente';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Bandi from './pages/Bandi';
import Match from './pages/Match';
import Report from './pages/Report';
import DettaglioBando from './pages/DettaglioBando';
import DettaglioCliente from './pages/DettaglioCliente';
import NotFound from './pages/NotFound';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminSettings from './pages/AdminSettings';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ImportaBandi from './pages/ImportaBandi';
import BandiImportati from './pages/BandiImportati';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/clienti" element={<Clienti />} />
          <Route path="/app/nuovo-cliente" element={<NuovoCliente />} />
          <Route path="/app/clienti/:id" element={<DettaglioCliente />} />
          <Route path="/app/fonti" element={<Fonti />} />
          <Route path="/app/match" element={<Match />} />
          <Route path="/app/bandi" element={<Bandi />} />
          <Route path="/app/bandi/:id" element={<DettaglioBando />} />
          <Route path="/app/report" element={<Report />} />
          <Route path="/app/change-password" element={<ChangePasswordPage />} />
          <Route path="/app/strumenti/importa-bandi" element={<ImportaBandi />} />
          <Route path="/app/strumenti/bandi-importati" element={<BandiImportati />} />
          <Route path="/app/admin/settings" element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          } />
          <Route path="/app/admin" element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
