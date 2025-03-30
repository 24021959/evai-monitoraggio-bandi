
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Rimuovi il badge di Lovable impostando l'attributo nell'URL
window.addEventListener('load', () => {
  // Imposta forzatamente il parametro per nascondere il badge Lovable
  const url = new URL(window.location.href);
  url.searchParams.set('forceHideBadge', 'true');
  window.history.replaceState({}, document.title, url.toString());
  
  // Rimuovi anche l'elemento del badge dal DOM se presente
  setTimeout(() => {
    const lovableBadge = document.querySelector('.lovable-badge');
    if (lovableBadge && lovableBadge.parentNode) {
      lovableBadge.parentNode.removeChild(lovableBadge);
    }
  }, 500);
});

createRoot(document.getElementById("root")!).render(<App />);
