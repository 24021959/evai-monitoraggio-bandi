
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Bandi from "./pages/Bandi";
import Clienti from "./pages/Clienti";
import NuovoCliente from "./pages/NuovoCliente";
import Match from "./pages/Match";
import Report from "./pages/Report";
import Fonti from "./pages/Fonti";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="bandi" element={<Bandi />} />
            <Route path="clienti" element={<Clienti />} />
            <Route path="clienti/nuovo" element={<NuovoCliente />} />
            <Route path="match" element={<Match />} />
            <Route path="report" element={<Report />} />
            <Route path="fonti" element={<Fonti />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
