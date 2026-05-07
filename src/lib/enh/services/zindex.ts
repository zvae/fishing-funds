export const FromEastmoney = async (code: string): Promise<Zindex.ResponseItem> => {
  const secid = code.includes('.') ? code : `1.${code}`;
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f60,f170,f171`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data) throw new Error('Zindex not found');
  
  const item = data.data;
  return {
    code: item.f57,
    name: item.f58,
    zx: item.f43 / 100,
    zdd: item.f44,
    zdf: item.f170,
    zs: item.f60,
    zg: item.f47 / 100,
    zd: item.f48 / 100,
  };
};

export const GetKFromEastmoney = async (
  code: string,
  year: number,
  k: number
): Promise<any[]> => {
  const secid = code.includes('.') ? code : `1.${code}`;
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57&klt=${k}&fqt=1&end=20500101`;
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
      volume: parseFloat(parts[5]),
    };
  });
};

export const GetTrendFromEastmoney = async (
  code: string,
  trendCode: string
): Promise<Zindex.TrendItem[]> => {
  const secid = code.includes('.') ? code : `1.${code}`;
  const url = `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.trends) return [];
  
  return data.data.trends.map((item: string) => {
    const parts = item.split(',');
    return {
      time: parts[0],
      price: parseFloat(parts[1]),
      cjl: parseFloat(parts[2]),
    };
  });
};

export const GetPicTrendFromEastmoney = async (secid: string): Promise<any> => {
  return {};
};

export const GetTreasuryYieldData = async (): Promise<any[]> => {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&fs=m:133&fields=f12,f14,f2,f3';
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    yield: item.f2,
  }));
};

export const GetNationalTeamDistributed = async (): Promise<any[]> => {
  return [];
};

export const GetNationalTeamDetail = async (code: string): Promise<any[]> => {
  return [];
};

export const GetNationalTeamTrend = async (): Promise<any[]> => {
  return [];
};

export const GetOilPriceFromEastmoney = async (): Promise<any[]> => {
  return [];
};

export const GetEconomyIndexFromEastmoney = async (
  reportName: string,
  fields: string
): Promise<any[]> => {
  const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?reportName=${reportName}&fields=${fields}&pageSize=50`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.result?.data) return [];
  
  return data.result.data;
};