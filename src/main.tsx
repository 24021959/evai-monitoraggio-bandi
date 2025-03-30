
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Rimuovi il badge di Lovable impostando l'attributo nell'URL
if (window.location.search.indexOf('forceHideBadge=true') === -1) {
  const url = new URL(window.location.href);
  url.searchParams.set('forceHideBadge', 'true');
  window.history.replaceState({}, document.title, url.toString());
}

createRoot(document.getElementById("root")!).render(<App />);
