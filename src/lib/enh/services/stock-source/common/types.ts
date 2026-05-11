export interface StockQuote {
  code: string;
  name: string;
  market: string;
  now: number;
  yesterday: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume?: number;
  amount?: number;
  time: string;
}

export interface StockSearchResult {
  code: string;
  name: string;
  market: string;
  type?: string;
}

export type DataSource = 'tencent' | 'sina' | 'eastmoney';

export interface StockSourceInterface {
  name: DataSource;
  
  getQuote(code: string): Promise<StockQuote | null>;
  
  getQuotes(codes: string[]): Promise<StockQuote[]>;
  
  search(keyword: string): Promise<StockSearchResult[]>;
  
  isAvailable(): Promise<boolean>;
}

export interface StockSourceConfig {
  preferOrder?: DataSource[];
  timeout?: number;
  retryTimes?: number;
}