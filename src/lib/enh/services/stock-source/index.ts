import type { StockSourceInterface, StockQuote, StockSearchResult, DataSource, StockSourceConfig } from './common/types';
import { TencentStockSource } from './sources/tencent';
import { SinaStockSource } from './sources/sina';
import { EastmoneyStockSource } from './sources/eastmoney';

export class StockSourceManager {
  private sources: Map<DataSource, StockSourceInterface>;
  private preferOrder: DataSource[];
  private retryTimes: number;

  constructor(config?: StockSourceConfig) {
    this.sources = new Map();
    this.sources.set('tencent', new TencentStockSource());
    this.sources.set('sina', new SinaStockSource());
    this.sources.set('eastmoney', new EastmoneyStockSource());
    
    this.preferOrder = config?.preferOrder || ['tencent', 'sina', 'eastmoney'];
    this.retryTimes = config?.retryTimes || 1;
  }

  async getQuote(code: string, preferredSource?: DataSource): Promise<StockQuote | null> {
    const sourcesToTry = preferredSource
      ? [preferredSource, ...this.preferOrder.filter(s => s !== preferredSource)]
      : this.preferOrder;

    for (const sourceName of sourcesToTry) {
      for (let attempt = 0; attempt < this.retryTimes; attempt++) {
        try {
          const source = this.sources.get(sourceName);
          if (!source) continue;

          const quote = await source.getQuote(code);
          if (quote && quote.now > 0) {
            console.log(`[StockSource] getQuote success from ${sourceName}:`, code);
            return quote;
          }
        } catch (error) {
          console.warn(`[StockSource] getQuote error from ${sourceName} (attempt ${attempt + 1}):`, error);
        }
      }
    }

    console.warn(`[StockSource] getQuote failed for all sources:`, code);
    return null;
  }

  async getQuotes(codes: string[], preferredSource?: DataSource): Promise<StockQuote[]> {
    const sourcesToTry = preferredSource
      ? [preferredSource, ...this.preferOrder.filter(s => s !== preferredSource)]
      : this.preferOrder;

    for (const sourceName of sourcesToTry) {
      try {
        const source = this.sources.get(sourceName);
        if (!source) continue;

        const quotes = await source.getQuotes(codes);
        if (quotes.length > 0) {
          console.log(`[StockSource] getQuotes success from ${sourceName}:`, quotes.length, 'items');
          return quotes;
        }
      } catch (error) {
        console.warn(`[StockSource] getQuotes error from ${sourceName}:`, error);
      }
    }

    console.warn(`[StockSource] getQuotes failed for all sources`);
    return [];
  }

  async search(keyword: string, preferredSource?: DataSource): Promise<StockSearchResult[]> {
    const sourcesToTry = preferredSource
      ? [preferredSource, ...this.preferOrder.filter(s => s !== preferredSource)]
      : this.preferOrder;

    for (const sourceName of sourcesToTry) {
      try {
        const source = this.sources.get(sourceName);
        if (!source) continue;

        const results = await source.search(keyword);
        if (results.length > 0) {
          console.log(`[StockSource] search success from ${sourceName}:`, results.length, 'items');
          return results;
        }
      } catch (error) {
        console.warn(`[StockSource] search error from ${sourceName}:`, error);
      }
    }

    console.warn(`[StockSource] search failed for all sources`);
    return [];
  }

  async getAvailableSources(): Promise<DataSource[]> {
    const available: DataSource[] = [];
    
    for (const [name, source] of this.sources) {
      try {
        const isAvailable = await source.isAvailable();
        if (isAvailable) {
          available.push(name);
        }
      } catch {
        console.warn(`[StockSource] ${name} is not available`);
      }
    }
    
    return available;
  }

  getSource(name: DataSource): StockSourceInterface | undefined {
    return this.sources.get(name);
  }

  addSource(name: DataSource, source: StockSourceInterface): void {
    this.sources.set(name, source);
    if (!this.preferOrder.includes(name)) {
      this.preferOrder.push(name);
    }
  }

  setPreferOrder(order: DataSource[]): void {
    this.preferOrder = order;
  }
}

export const stockSource = new StockSourceManager();

export const getStockQuote = (code: string, preferredSource?: DataSource) => 
  stockSource.getQuote(code, preferredSource);

export const getStockQuotes = (codes: string[], preferredSource?: DataSource) => 
  stockSource.getQuotes(codes, preferredSource);

export const searchStock = (keyword: string, preferredSource?: DataSource) => 
  stockSource.search(keyword, preferredSource);

export { TencentStockSource } from './sources/tencent';
export { SinaStockSource } from './sources/sina';
export { EastmoneyStockSource } from './sources/eastmoney';
export type { StockQuote, StockSearchResult, DataSource, StockSourceInterface } from './common/types';
