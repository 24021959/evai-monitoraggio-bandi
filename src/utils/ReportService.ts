
import { ReportData } from '@/types/report';

class ReportServiceClass {
  async getReportData(): Promise<ReportData> {
    // Dati di esempio per il report
    return {
      totaleMatch: 248,
      tassoSuccesso: 87.5,
      fontiAttive: 5,
      tempoMedioElaborazione: 342,
      analisiTemporale: [
        { periodo: 'Gen 2023', totaleMatch: 42, tassoSuccesso: 85.2 },
        { periodo: 'Feb 2023', totaleMatch: 38, tassoSuccesso: 86.1 },
        { periodo: 'Mar 2023', totaleMatch: 45, tassoSuccesso: 88.4 },
        { periodo: 'Apr 2023', totaleMatch: 43, tassoSuccesso: 87.9 },
        { periodo: 'Mag 2023', totaleMatch: 39, tassoSuccesso: 89.2 },
        { periodo: 'Giu 2023', totaleMatch: 41, tassoSuccesso: 88.7 }
      ],
      performanceMatch: [
        { fonte: 'Europa.eu', totaleMatch: 82, percentualeSuccesso: 92.5, mediaTempoElaborazione: 310 },
        { fonte: 'Regione Lombardia', totaleMatch: 65, percentualeSuccesso: 88.2, mediaTempoElaborazione: 325 },
        { fonte: 'Ministero Sviluppo', totaleMatch: 48, percentualeSuccesso: 86.4, mediaTempoElaborazione: 350 },
        { fonte: 'INPS', totaleMatch: 32, percentualeSuccesso: 84.1, mediaTempoElaborazione: 380 },
        { fonte: 'Camera di Commercio', totaleMatch: 21, percentualeSuccesso: 82.7, mediaTempoElaborazione: 345 }
      ],
      distribuzioneFonti: [
        { fonte: 'Europa.eu', valore: 33 },
        { fonte: 'Regione Lombardia', valore: 26 },
        { fonte: 'Ministero Sviluppo', valore: 19 },
        { fonte: 'INPS', valore: 13 },
        { fonte: 'Camera di Commercio', valore: 9 }
      ]
    };
  }
}

export const ReportService = new ReportServiceClass();
