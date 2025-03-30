
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';

import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import Dashboard from '@/pages/Dashboard';
import Bandi from '@/pages/Bandi';
import DettaglioBando from '@/pages/DettaglioBando';
import Clienti from '@/pages/Clienti';
import DettaglioCliente from '@/pages/DettaglioCliente';
import NuovoCliente from '@/pages/NuovoCliente';
import Fonti from '@/pages/Fonti';
import Match from '@/pages/Match';
import Report from '@/pages/Report';
import ImportaBandi from '@/pages/ImportaBandi';
import AdminSettings from '@/pages/AdminSettings';
import AdminPage from '@/pages/AdminPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bandi" element={<Bandi />} />
          <Route path="bandi/:id" element={<DettaglioBando />} />
          <Route path="clienti" element={<Clienti />} />
          <Route path="clienti/:id" element={<DettaglioCliente />} />
          <Route path="clienti/nuovo" element={<NuovoCliente />} />
          <Route path="fonti" element={<Fonti />} />
          <Route path="match" element={<Match />} />
          <Route path="report" element={<Report />} />
          <Route path="strumenti/importa-bandi" element={<ImportaBandi />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<AdminSettings />} />
          <Route path="admin/gestione" element={<AdminPage />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
