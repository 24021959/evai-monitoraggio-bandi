
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Rimuovi completamente il badge di Lovable
window.addEventListener('load', () => {
  // Imposta forzatamente il parametro per nascondere il badge Lovable
  const url = new URL(window.location.href);
  url.searchParams.set('forceHideBadge', 'true');
  window.history.replaceState({}, document.title, url.toString());
  
  // Funzione per rimuovere il badge
  const removeBadge = () => {
    // Cerca per classe
    const badges = document.querySelectorAll('.lovable-badge, [class*="lovable"]');
    badges.forEach(badge => {
      if (badge && badge.parentNode) {
        badge.parentNode.removeChild(badge);
      }
    });
    
    // Cerca per attributi data-*
    const dataElements = document.querySelectorAll('[data-lovable], [data-*="lovable"]');
    dataElements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };
  
  // Esegui la rimozione subito
  removeBadge();
  
  // E continua a verificare periodicamente per un po' per assicurarsi che non ricompaia
  const checkInterval = setInterval(() => {
    removeBadge();
  }, 500);
  
  // Interrompi il controllo dopo 5 secondi
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 5000);
});

createRoot(document.getElementById("root")!).render(<App />);
