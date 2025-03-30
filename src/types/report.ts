
export interface ReportAnalisiTemporale {
  periodo: string;
  totaleMatch: number;
  tassoSuccesso: number;
}

export interface ReportPerformanceMatch {
  fonte: string;
  totaleMatch: number;
  percentualeSuccesso: number;
  mediaTempoElaborazione: number;
}

export interface ReportDistribuzioneFonti {
  fonte: string;
  valore: number;
}

export interface ReportData {
  totaleMatch: number;
  tassoSuccesso: number;
  fontiAttive: number;
  numeroClienti: number;
  analisiTemporale: ReportAnalisiTemporale[];
  performanceMatch: ReportPerformanceMatch[];
  distribuzioneFonti: ReportDistribuzioneFonti[];
}
