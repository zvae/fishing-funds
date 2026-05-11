import { fetchText } from '../../../request';
import type { StockSourceInterface, StockQuote, StockSearchResult } from '../../common/types';
import { parseGBKText, convertToTencentCode, parseStockCodeFromMarket } from '../../common/utils';

export class TencentStockSource implements StockSourceInterface {
  name = 'tencent' as const;

  async getQuote(code: string): Promise<StockQuote | null> {
    try {
      const tencentCode = convertToTencentCode(code);
      const url = `https://qt.gtimg.cn/q=${tencentCode}`;
      
      const text = await fetchText(url);
      const decoded = parseGBKText(new TextEncoder().encode(text).buffer);
      
      return this.parseQuoteResponse(decoded, code);
    } catch (error) {
      console.error('[Tencent] getQuote error:', error);
      return null;
    }
  }

  async getQuotes(codes: string[]): Promise<StockQuote[]> {
    try {
      const tencentCodes = codes.map(c => convertToTencentCode(c));
      const url = `https://qt.gtimg.cn/q=${tencentCodes.join(',')}`;
      
      const text = await fetchText(url);
      const decoded = parseGBKText(new TextEncoder().encode(text).buffer);
      
      const results: StockQuote[] = [];
      const lines = decoded.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const match = line.match(/v_(\w+)="(.*)"/);
        if (match) {
          const quote = this.parseQuoteLine(match[2], match[1]);
          if (quote) results.push(quote);
        }
      }
      
      return results;
    } catch (error) {
      console.error('[Tencent] getQuotes error:', error);
      return [];
    }
  }

  async search(keyword: string): Promise<StockSearchResult[]> {
    try {
      const url = `https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=${encodeURIComponent(keyword)}`;
      
      const text = await fetchText(url);
      const decoded = parseGBKText(new TextEncoder().encode(text).buffer);
      
      return this.parseSearchResponse(decoded);
    } catch (error) {
      console.error('[Tencent] search error:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const url = 'https://qt.gtimg.cn/q=sh600519';
      const text = await fetchText(url);
      return text.includes('v_sh600519');
    } catch {
      return false;
    }
  }

  private parseQuoteResponse(text: string, originalCode: string): StockQuote | null {
    const match = text.match(/v_\w+="(.*)"/);
    if (!match) return null;
    
    return this.parseQuoteLine(match[1], originalCode);
  }

  private parseQuoteLine(data: string, codeKey: string): StockQuote | null {
    try {
      const parts = data.split('~');
      if (parts.length < 35) return null;
      
      const { code, market } = parseStockCodeFromMarket(codeKey);
      
      const now = parseFloat(parts[3]) || 0;
      const yesterday = parseFloat(parts[4]) || 0;
      const change = yesterday > 0 ? now - yesterday : 0;
      const changePercent = yesterday > 0 ? (change / yesterday) * 100 : 0;
      
      return {
        code,
        name: parts[1],
        market: market.toUpperCase(),
        now,
        yesterday,
        high: parseFloat(parts[33]) || 0,
        low: parseFloat(parts[34]) || 0,
        change,
        changePercent,
        volume: parseFloat(parts[6]) || 0,
        amount: parseFloat(parts[37]) || 0,
        time: new Date().toLocaleString(),
      };
    } catch {
      return null;
    }
  }

  private parseSearchResponse(text: string): StockSearchResult[] {
    try {
      const match = text.match(/v_hint="(.*)"/);
      if (!match) return [];
      
      const results: StockSearchResult[] = [];
      const items = match[1].split('^');
      
      for (const item of items) {
        // const [market, code] = item.split('~');
         const [market, code, rawName, py, type] = item.split('~');
        if (market && code && rawName) {
          results.push({
            code,
            name: decodeURIComponent(JSON.parse(`"${rawName}"`)),
            market: market.toUpperCase(),
            type: this.getMarketType(market.toLowerCase())
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
      'us': '美股',
    };
    return typeMap[market.toLowerCase()] || '其他';
  }
}