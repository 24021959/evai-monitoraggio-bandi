
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

const queryClient = new QueryClient();

// Determina il percorso base dal tuo ambiente
const basename = process.env.NODE_ENV === 'production' 
  ? '/baf31591-0e28-4267-94a8-ed6bf96b1284' 
  : '/';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Layout />}>
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
            <Route path="admin" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
