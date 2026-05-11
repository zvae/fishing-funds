import { fetchJson } from '../../../request';
import type { StockSourceInterface, StockQuote, StockSearchResult } from '../../common/types';
import { convertToEastmoneyCode, parseStockCodeFromMarket } from '../../common/utils';

export class EastmoneyStockSource implements StockSourceInterface {
  name = 'eastmoney' as const;

  async getQuote(code: string): Promise<StockQuote | null> {
    try {
      const emCode = convertToEastmoneyCode(code);
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${emCode}&fields=f12,f14,f2,f3,f15,f16,f18,f43,f44,f45,f170`;
      
      const data = await fetchJson<any>(url, {
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      return this.parseQuoteResponse(data, code);
    } catch (error) {
      console.error('[Eastmoney] getQuote error:', error);
      return null;
    }
  }

  async getQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      const emCodes = codes.map(c => convertToEastmoneyCode(c));
      const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${emCodes.join(',')}&fields=f12,f14,f2,f3,f15,f16,f18`;
      
      const data = await fetchJson<any>(url, {
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      if (!data.data?.diff) return [];
      
      return data.data.diff.map((item: any) => this.parseQuoteItem(item)).filter((q: StockQuote | null): q is StockQuote => q !== null);
    } catch (error) {
      console.error('[Eastmoney] getQuotes error:', error);
      return [];
    }
  }

  async search(keyword: string): Promise<StockSearchResult[]> {
    try {
      const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(keyword)}&type=14&token=D43BF722C8E33BDC906FB84D85E326E8`;
      
      const data = await fetchJson<any>(url, {
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      return this.parseSearchResponse(data);
    } catch (error) {
      console.error('[Eastmoney] search error:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const url = 'https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519&fields=f12,f14';
      const data = await fetchJson<any>(url, {
        headers: {
          'Referer': 'https://quote.eastmoney.com/'
        }
      });
      return data && data.data && data.data.f12 === '600519';
    } catch {
      return false;
    }
  }

  private parseQuoteResponse(data: any, originalCode: string): StockQuote | null {
    try {
      if (!data || !data.data) return null;
      
      const item = data.data;
      return this.parseQuoteItem(item);
    } catch {
      return null;
    }
  }

  private parseQuoteItem(item: any): StockQuote | null {
    try {
      if (!item || !item.f12) return null;
      
      const now = item.f2 || item.f43 || 0;
      const yesterday = item.f18 || item.f60 || 0;
      const changePercent = (item.f3 || item.f170 || 0) / 100;
      const change = yesterday > 0 ? now - yesterday : 0;
      
      return {
        code: item.f12,
        name: item.f14,
        market: item.f12.startsWith('6') ? 'SH' : 'SZ',
        now,
        yesterday,
        high: item.f15 || item.f44 || 0,
        low: item.f16 || item.f45 || 0,
        change,
        changePercent,
        time: new Date().toLocaleString(),
      };
    } catch {
      return null;
    }
  }

  private parseSearchResponse(data: any): StockSearchResult[] {
    try {
      if (!data || !data.QuotationCodeTable?.Data) return [];
      
      return data.QuotationCodeTable.Data.map((item: any) => ({
        code: item.Code,
        name: item.Name,
        market: item.MktNum === '1' ? 'SH' : 'SZ',
        type: item.MktNum === '1' ? '上交所' : '深交所',
      }));
    } catch {
      return [];
    }
  }
}