export const FromEastmoney = async (secid: string): Promise<Stock.ResponseItem> => {
  const [market, code] = secid.split('.');
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f60,f170,f171`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data) throw new Error('Stock not found');
  
  const item = data.data;
  return {
    secid,
    code: item.f57,
    name: item.f58,
    market: parseInt(market),
    zx: item.f43 / 100,
    zdd: item.f44,
    zdf: item.f170,
    zs: item.f60,
    zg: item.f47,
    zd: item.f48,
    jk: item.f46,
    time: new Date().toLocaleString(),
    trends: [],
  };
};

export const SearchFromEastmoney = async (keyword: string): Promise<Stock.SearchResult[]> => {
  const url = `https://searchapi.eastmoney.com/bussiness/web/QuotationLabelSearch?keyword=${encodeURIComponent(keyword)}`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.QuotationLabelSearch?.returnData?.datas) return [];
  
  const result: Stock.SearchResult[] = [];
  const types = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  
  for (const item of data.QuotationLabelSearch.returnData.datas) {
    if (types.has(item.Type)) {
      result.push({
        Type: item.Type,
        Name: item.TypeName,
        Count: item.Count,
        Datas: item.Datas.map((d: any) => ({
          Code: d.Code,
          Name: d.Name,
          ID: d.ID,
          MktNum: d.MktNum,
          SecurityType: d.SecurityType,
          UnifiedId: d.UnifiedId,
          MarketType: d.MarketType,
          JYS: d.JYS,
          UnifiedCode: d.UnifiedCode,
        })),
      });
    }
  }
  
  return result;
};

export const GetIndustryFromEastmoney = async (secid: string, type: number): Promise<Stock.IndustryItem[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?secid=${secid}&fid=f62&po=1&pn=1&pz=50&fs=b:${type === 1 ? 'MK0021' : 'MK0022'}&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    secid: `${type === 1 ? '90' : '91'}.${item.f12}`,
  }));
};

export const GetStockRank = async (fsCode: string): Promise<any[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&fs=${fsCode}&fields=f12,f14,f2,f3,f4,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f124,f1,f13`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    secid: `${item.f13}.${item.f12}`,
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
  }));
};

export const GetMainRankFromEastmoney = async (dayType: string): Promise<any[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=100&fs=m:90+t:2&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
  }));
};

export const GetSelfRankFromEastmoney = async (dayType: string): Promise<any[]> => {
  return [];
};

export const GetNorthRankFromEastmoney = async (dayType: string): Promise<any[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=100&fs=m:90+t:3&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
  }));
};

export const GetDetailFromEastmoney = async (secid: string): Promise<Stock.DetailItem> => {
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f60,f170,f171`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data) throw new Error('Stock not found');
  
  const item = data.data;
  return {
    code: item.f57,
    name: item.f58,
    market: parseInt(secid.split('.')[0]),
    zg: item.f47 / 100,
    zd: item.f48 / 100,
    jk: item.f46 / 100,
    zss: 0,
    zt: 0,
    dt: 0,
    zx: item.f43 / 100,
    cjl: 0,
    lb: 0,
    cje: 0,
    wp: 0,
    zs: item.f60,
    jj: 0,
    np: 0,
    hs: 0,
    zdd: item.f44,
    zdf: item.f170,
    time: new Date().toLocaleString(),
  };
};

export const GetTrendFromEastmoney = async (secid: string): Promise<Stock.TrendItem[]> => {
  const [market, code] = secid.split('.');
  const url = `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58&isccr=0`;
  const data = await fetch(url).then((r) => r.json());
  
  if (!data.data?.trends) return [];
  
  return data.data.trends.map((item: string) => {
    const parts = item.split(',');
    return {
      datetime: parts[0],
      last: parseFloat(parts[1]),
      current: parseFloat(parts[2]),
      average: parseFloat(parts[3]),
    };
  });
};

export const GetKFromEastmoney = async (secid: string, kCode: number, timeCode: number): Promise<any[]> => {
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57&klt=${kCode}&fqt=${timeCode}&end=20500101`;
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
      amount: parseFloat(parts[6]),
    };
  });
};

export const GetPicTrendFromEastmoney = async (secid: string): Promise<any> => {
  return {};
};

export const GetReportDate = async (): Promise<string[]> => {
  return ['2024-12-31', '2024-09-30', '2024-06-30', '2024-03-31'];
};

export const GetStockHoldFunds = async (secid: string, date: string): Promise<any[]> => {
  const [market, code] = secid.split('.');
  const url = `https://datafunds.eastmoney.com/data/FundHoldData?stockcode=${code}&type=1&date=${date}`;
  const data = await fetch(url).then((r) => r.json());
  
  return data.datas || [];
};

export const GetABCompany = async (secid: string): Promise<Stock.Company> => {
  const [market, code] = secid.split('.');
  const url = `https://emweb.eastmoney.com/PC_HSF10/CompanySurvey/Index?type=web&code=${secid}`;
  const html = await fetch(url).then((r) => r.text());
  
  return {
    gsjs: '',
    sshy: '',
    dsz: '',
    zcdz: '',
    clrq: '',
    ssrq: '',
  };
};

export const GetHKCompany = GetABCompany;
export const GetUSCompany = GetABCompany;
export const GetXSBCompany = GetABCompany;

export const GetMeetingData = async (params: {
  code: string;
  startTime: string;
  endTime: string;
}): Promise<any[]> => {
  const url = `https://datainterface.eastmoney.com/EM_DataCenter/JS.aspx?type=SR&sty=SR01&st=2&sc=3&p=1&ps=100&code=${params.code}&spt=${params.startTime}&ept=${params.endTime}`;
  const data = await fetch(url).then((r) => r.json());
  
  return data.datas || [];
};

export const GetCloseDayDates = async (): Promise<string[]> => {
  const url = 'https://quote.eastmoney.com/stockapi/getCloseDayDates';
  const data = await fetch(url).then((r) => r.json());
  
  return data.data || [];
};