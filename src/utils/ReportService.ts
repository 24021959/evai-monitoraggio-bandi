
import { supabase } from '@/integrations/supabase/client';
import { ReportData } from '@/types/report';

class ReportServiceClass {
  async getReportData(): Promise<ReportData> {
    try {
      console.log("Fetching real report data from database...");
      
      // Get all bandi
      const { data: bandiData, error: bandiError } = await supabase
        .from('bandi')
        .select('*');
      
      if (bandiError) {
        console.error("Error fetching bandi:", bandiError);
        throw new Error(bandiError.message);
      }
      
      // Get all match entries
      const { data: matchData, error: matchError } = await supabase
        .from('match')
        .select('*');
      
      if (matchError) {
        console.error("Error fetching matches:", matchError);
        throw new Error(matchError.message);
      }
      
      // Get all fonti
      const { data: fontiData, error: fontiError } = await supabase
        .from('fonti')
        .select('*');
      
      if (fontiError) {
        console.error("Error fetching fonti:", fontiError);
        throw new Error(fontiError.message);
      }

      // Calculate actual metrics from real data
      
      // Calculate total matches
      const totaleMatch = matchData.length;
      
      // Calculate success rate (matches with compatibility > 70 divided by total)
      const successfulMatches = matchData.filter(match => match.compatibilita > 70).length;
      const tassoSuccesso = totaleMatch > 0 
        ? (successfulMatches / totaleMatch) * 100 
        : 0;
      
      // Count active fonti
      const fontiAttive = fontiData.filter(fonte => fonte.stato === 'attivo').length;
      
      // Generate time analysis data - group by month using created_at
      const analisiTemporale = this.generateTimeAnalysis(matchData);
      
      // Generate distribuzione per fonte data
      const distribuzioneFonti = this.generateDistribuzioneFonti(bandiData);
      
      return {
        totaleMatch,
        tassoSuccesso,
        fontiAttive,
        tempoMedioElaborazione: 0, // We're not using this anymore
        analisiTemporale,
        performanceMatch: [], // We're not using this anymore
        distribuzioneFonti
      };
    } catch (error) {
      console.error("Error in getReportData:", error);
      throw error;
    }
  }

  // Helper method to generate time-based analysis
  private generateTimeAnalysis(matchData: any[]): any[] {
    // Group matches by month
    const monthlyData = new Map();
    
    // Process last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today);
      month.setMonth(today.getMonth() - i);
      
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      const monthName = month.toLocaleString('it-IT', { month: 'short' });
      const yearMonth = `${monthName} ${month.getFullYear()}`;
      
      monthlyData.set(monthKey, {
        periodo: yearMonth,
        totaleMatch: 0,
        tassoSuccesso: 0
      });
    }
    
    // Count matches per month and calculate success rate
    matchData.forEach(match => {
      const date = new Date(match.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        monthData.totaleMatch += 1;
        
        // Consider match successful if compatibility > 70%
        if (match.compatibilita > 70) {
          monthData.successfulMatches = (monthData.successfulMatches || 0) + 1;
        }
      }
    });
    
    // Calculate success rates
    const result = Array.from(monthlyData.values()).map(data => {
      const { totaleMatch, successfulMatches = 0 } = data;
      return {
        ...data,
        tassoSuccesso: totaleMatch > 0 ? (successfulMatches / totaleMatch) * 100 : 0
      };
    });
    
    return result;
  }

  // New helper method to generate distribuzione per fonte data
  private generateDistribuzioneFonti(bandiData: any[]): any[] {
    // Group bandi by fonte and count
    const fonteCount: Record<string, number> = {};
    
    bandiData.forEach(bando => {
      if (bando.fonte) {
        fonteCount[bando.fonte] = (fonteCount[bando.fonte] || 0) + 1;
      }
    });
    
    // Convert to array with name and value for the pie chart
    return Object.entries(fonteCount)
      .map(([fonte, valore]) => ({
        fonte,
        valore
      }))
      .sort((a, b) => b.valore - a.valore);
  }
}

export const ReportService = new ReportServiceClass();
