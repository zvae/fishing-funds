import { fetchText } from '../../../request';
import type { StockSourceInterface, StockQuote, StockSearchResult } from '../../common/types';
import { parseGBKText, convertToSinaCode, parseStockCodeFromMarket } from '../../common/utils';

export class SinaStockSource implements StockSourceInterface {
  name = 'sina' as const;

  async getQuote(code: string): Promise<StockQuote | null> {
    try {
      const sinaCode = convertToSinaCode(code);
      const url = `https://hq.sinajs.cn/list=${sinaCode}`;
      
      const text = await fetchText(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn/'
        }
      });
      
      const decoded = parseGBKText(new TextEncoder().encode(text).buffer);
      return this.parseQuoteResponse(decoded, code);
    } catch (error) {
      console.error('[Sina] getQuote error:', error);
      return null;
    }
  }

  async getQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      const sinaCodes = codes.map(c => convertToSinaCode(c));
      const url = `https://hq.sinajs.cn/list=${sinaCodes.join(',')}`;
      
      const text = await fetchText(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn/'
        }
      });
      
      const decoded = parseGBKText(new TextEncoder().encode(text).buffer);
      const results: StockQuote[] = [];
      const lines = decoded.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const match = line.match(/var hq_str_(\w+)="(.*)"/);
        if (match) {
          const quote = this.parseQuoteLine(match[2], match[1]);
          if (quote) results.push(quote);
        }
      }
      
      return results;
    } catch (error) {
      console.error('[Sina] getQuotes error:', error);
      return [];
    }
  }

  async search(keyword: string): Promise<StockSearchResult[]> {
    try {
      const url = `https://suggest3.sinajs.cn/suggest/type=2&key=${encodeURIComponent(keyword)}`;
      
      const text = await fetchText(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn/'
        }
      });
      
      const decoded = parseGBKText(new TextEncoder().encode(text).buffer);
      return this.parseSearchResponse(decoded);
    } catch (error) {
      console.error('[Sina] search error:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const url = 'https://hq.sinajs.cn/list=sh600519';
      const text = await fetchText(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn/'
        }
      });
      return text.includes('hq_str_sh600519');
    } catch {
      return false;
    }
  }

  private parseQuoteResponse(text: string, originalCode: string): StockQuote | null {
    const match = text.match(/var hq_str_\w+="(.*)"/);
    if (!match) return null;
    
    return this.parseQuoteLine(match[1], originalCode);
  }

  private parseQuoteLine(data: string, codeKey: string): StockQuote | null {
    try {
      if (!data || data.trim() === '') return null;
      
      const parts = data.split(',');
      if (parts.length < 6) return null;
      
      const { code, market } = parseStockCodeFromMarket(codeKey);
      const marketType = market.toLowerCase();
      
      let now: number, yesterday: number, high: number, low: number;
      
      if (marketType === 'sh' || marketType === 'sz') {
        now = parseFloat(parts[3]) || 0;
        yesterday = parseFloat(parts[2]) || 0;
        high = parseFloat(parts[4]) || 0;
        low = parseFloat(parts[5]) || 0;
      } else if (marketType === 'hk') {
        now = parseFloat(parts[6]) || 0;
        yesterday = parseFloat(parts[3]) || 0;
        high = parseFloat(parts[4]) || 0;
        low = parseFloat(parts[5]) || 0;
      } else if (marketType === 'gb_') {
        now = parseFloat(parts[1]) || 0;
        yesterday = parseFloat(parts[26]) || 0;
        high = parseFloat(parts[6]) || 0;
        low = parseFloat(parts[7]) || 0;
      } else {
        now = parseFloat(parts[3]) || 0;
        yesterday = parseFloat(parts[2]) || 0;
        high = parseFloat(parts[4]) || 0;
        low = parseFloat(parts[5]) || 0;
      }
      
      const change = yesterday > 0 ? now - yesterday : 0;
      const changePercent = yesterday > 0 ? (change / yesterday) * 100 : 0;
      
      return {
        code,
        name: parts[0],
        market: market.toUpperCase(),
        now,
        yesterday,
        high,
        low,
        change,
        changePercent,
        volume: parseFloat(parts[8]) || 0,
        amount: parseFloat(parts[9]) || 0,
        time: new Date().toLocaleString(),
      };
    } catch {
      return null;
    }
  }

  private parseSearchResponse(text: string): StockSearchResult[] {
    try {
      const match = text.match(/var suggestvalue="(.*)"/);
      if (!match) return [];
      
      const results: StockSearchResult[] = [];
      const items = match[1].split(';').filter(item => item.trim());
      
      for (const item of items) {
        const parts = item.split(',');
        if (parts.length >= 2) {
          const fullCode = parts[0];
          const { market, code } = parseStockCodeFromMarket(fullCode);
          
          results.push({
            code,
            name: parts[1],
            market: market.toUpperCase(),
            type: this.getMarketType(market),
          });
        }
      }
      
      return results;
    } catch {
      return [];
    }
  }

  private getMarketType(market: string): string {
    const typeMap: Record<string, string> = {
      'sh': '上交所',
      'sz': '深交所',
      'hk': '港交所',
      'gb_': '美股',
      'of': '基金',
    };
    return typeMap[market.toLowerCase()] || '其他';
  }
}