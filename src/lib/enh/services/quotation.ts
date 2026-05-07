export const GetQuotationsFromEastmoney = async (
  type: string,
  page: number = 1
): Promise<Quotation.ResponseItem[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=${page}&pz=100&fs=${type}&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f124,f1,f13`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
    zde: item.f62,
    zdd: item.f66,
    zsz: item.f69,
    zxj: item.f2,
    szjs: item.f75,
    xdjs: item.f78,
  }));
};

export const GetFlowFromEastmoney = async (
  fields1: string,
  code: string
): Promise<{ time: string; h: number; s: number; value: number }[]> => {
  const url = `https://push2.eastmoney.com/api/qt/stock/fflow/kline?secid=${code === 's2n' ? '1.000001' : '0.399001'}&fields1=${fields1}&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.klines) return [];
  
  return data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return {
      time: parts[0],
      h: parseFloat(parts[1]),
      s: parseFloat(parts[2]),
      value: parseFloat(parts[3]),
    };
  });
};

export const GetNorthDayFromEastmoney = async (
  fields1: string,
  dayType: string
): Promise<{ s2n: any[]; hk2sh: any[]; hk2sz: any[] }> => {
  const url = `https://push2.eastmoney.com/api/qt/stock/fflow/daykline?secid=1.000001&lmt=${dayType}&fields1=${fields1}`;
  const data = await fetch(url).then((r) => r.json());
  
  return {
    s2n: data.data?.klines || [],
    hk2sh: [],
    hk2sz: [],
  };
};

export const GetSouthDayFromEastmoney = GetNorthDayFromEastmoney;

export const GetFundFlowFromEastmoney = async (code: string, type: number): Promise<any[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=100&fs=${code}&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
    zde: item.f62,
  }));
};

export const GetQuotationDetailFromEastmoney = async (
  code: string
): Promise<Quotation.DetailData> => {
  const secid = code.includes('.') ? code : `90.${code}`;
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f60,f170,f171`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data) throw new Error('Quotation not found');
  
  return data.data;
};

export const GetStocksFromEasymoney = async (code: string): Promise<any[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&fs=b:${code}&fields=f12,f14,f2,f3,f62,f184,f66,f69`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
    zde: item.f62,
  }));
};

export const GetRealTimeFundFlowFromEasymoney = async (secid: string): Promise<any> => {
  const url = `https://push2.eastmoney.com/api/qt/stock/fflow/secid?secid=${secid}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65,f66,f67,f68,f69,f70,f71,f72`;
  const data = await fetch(url).then((r) => r.json());
  
  return data.data || {};
};

export const GetAfterTimeFundFlowFromEasymoney = GetRealTimeFundFlowFromEasymoney;

export const GetRecentHotFromEastmoney = async (): Promise<any[]> => {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&fs=m:90+t:3&fields=f12,f14,f2,f3,f62';
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
  }));
};

export const GetTodayHotFromEastmoney = async (): Promise<any[]> => {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&fs=m:90+t:2&fields=f12,f14,f2,f3,f62';
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
  }));
};

export const GetHotThemeFromEastmoney = async (): Promise<any[]> => {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&fs=m:90+t:1&fields=f12,f14,f2,f3,f62';
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
  }));
};

export const GetQuoteCenterFromEastmoney = async (): Promise<any> => {
  return {};
};

export const GetShanghaiGoldGoodsFromEastmoney = async (): Promise<any[]> => {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&fs=m:133&fields=f12,f14,f2,f3,f62';
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    price: item.f2,
    changePercent: item.f3,
  }));
};

export const GetGoldKFromEastmoney = async (): Promise<any[]> => {
  const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=1.AU0&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57&klt=101&fqt=1';
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.klines) return [];
  
  return data.data.klines.map((item: string) => {
    const parts = item.split(',');
    return {
      date: parts[0],
      open: parseFloat(parts[1]),
      close: parseFloat(parts[2]),
      high: parseFloat(parts[3]),
      low: parseFloat(parts[4]),
    };
  });
};

export const GetInternationalMetalGoodsFromEastmoney = async (): Promise<any[]> => {
  return [];
};

export const GetInternationalMetalFuturesFromEastmoney = async (): Promise<any[]> => {
  return [];
};

export const GetShanghaiGoldFuturesFromEastmoney = async (): Promise<any[]> => {
  return [];
};

export const GetGoldTrendsFromEastmoney = async (secid: string): Promise<any[]> => {
  return [];
};

export const GetTopicFBFailedFromEastmoney = async (): Promise<any[]> => {
  return [];
};

export const GetGBTrendFromEastmoney = async (): Promise<any[]> => {
  return [];
};

export const GetDistributionFromEastmoney = async (): Promise<any> => {
  return {};
};

export const Get2MarketVolume = async (): Promise<any[]> => {
  return [];
};

export const GetMainFundFromEastmoney = async (code: string): Promise<any> => {
  return {};
};

export const GetTopicZDTCountFromEastmoney = async (): Promise<any> => {
  return {};
};

export const GetFundsFromEastmoney = async (code: string): Promise<any[]> => {
  return [];
};

export const GetTransactionFromEasymoney = async (code: string): Promise<any> => {
  return {};
};