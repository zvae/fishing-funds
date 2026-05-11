import { fetchJson, fetchText, jsonp } from './request';
import { getStockQuote, searchStock, type StockQuote } from './stock-source';

export const FromEastmoney = async (secid: string): Promise<Stock.ResponseItem> => {
  try {
    const [market, code] = secid.split('.');
    
    const quote = await getStockQuote(code);
    
    if (!quote) {
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f60,f170,f171`;
      const data = await fetchJson<any>(url);

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
    }

    return {
      secid,
      code: quote.code,
      name: quote.name,
      market: quote.market === 'SH' ? 1 : 0,
      zx: quote.now,
      zdd: quote.change,
      zdf: quote.changePercent,
      zs: quote.yesterday,
      zg: quote.high,
      zd: quote.low,
      jk: quote.now,
      time: quote.time,
      trends: [],
    };
  } catch (error) {
    console.error('FromEastmoney error:', error);
    throw error;
  }
};

export const SearchFromEastmoney = async (keyword: string): Promise<Stock.SearchResult[]> => {
  try {
    const results = await searchStock(keyword);
    
    if (results.length === 0) {
      const url = `https://suggest3.sinajs.cn/suggest/type=11,12,13,14,15&name=${encodeURIComponent(keyword)}`;
      const text = await fetchText(url);
      
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) return [];
      
      const result: Stock.SearchResult[] = [];
      const stockDatas: any[] = [];
      
      for (const line of lines) {
        const match = line.match(/suggest\["([^"]+)"\]\s*=\s*"([^"]+)"/);
        if (!match) continue;
        
        const key = match[1];
        const dataStr = match[2];
        const parts = dataStr.split(',');
        
        if (parts.length >= 6) {
          const type = parts[0];
          const code = parts[2];
          const name = parts[1];
          const market = parts[3];
          
          stockDatas.push({
            Code: code,
            Name: name,
            ID: code,
            MktNum: market.includes('sh') ? '1' : market.includes('sz') ? '0' : '0',
            SecurityType: type === '11' ? 'A股' : type === '12' ? 'B股' : type === '13' ? '港股' : '其他',
            UnifiedId: code,
            MarketType: market.includes('sh') ? 1 : 0,
            JYS: market.includes('sh') ? '上海' : market.includes('sz') ? '深圳' : '其他',
            UnifiedCode: code,
          });
        }
      }
      
      if (stockDatas.length > 0) {
        result.push({
          Type: 1,
          Name: '股票',
          Count: stockDatas.length,
          Datas: stockDatas,
        });
      }
      
      return result;
    }
    
    const stockDatas = results.map(item => ({
      Code: item.code,
      Name: item.name || '',
      ID: item.code,
      MktNum: item.market === 'SH' ? '1' : '0',
      SecurityType: item.type || '股票',
      UnifiedId: item.code,
      MarketType: item.market === 'SH' ? 1 : 0,
      JYS: item.market === 'SH' ? '上海' : '深圳',
      UnifiedCode: item.code,
    }));
    
    return [{
      Type: 1,
      Name: '股票',
      Count: stockDatas.length,
      Datas: stockDatas,
    }];
  } catch (error) {
    console.error('SearchFromEastmoney error:', error);
    return [];
  }
};

export const GetIndustryFromEastmoney = async (secid: string, type: number): Promise<Stock.IndustryItem[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?secid=${secid}&fid=f62&po=1&pn=1&pz=50&fs=b:${type === 1 ? 'MK0021' : 'MK0022'}&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87`;
  const data = await fetchJson<any>(url);

  if (!data.data?.diff) return [];

  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    secid: `${type === 1 ? '90' : '91'}.${item.f12}`,
  }));
};

export const GetStockRank = async (fsCode: string): Promise<any[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&fs=${fsCode}&fields=f12,f14,f2,f3,f4,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f124,f1,f13`;
  const data = await fetchJson<any>(url);

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
  const data = await fetchJson<any>(url);

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
  const data = await fetchJson<any>(url);

  if (!data.data?.diff) return [];

  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    zdf: item.f3,
  }));
};

export const GetDetailFromEastmoney = async (secid: string): Promise<Stock.DetailItem> => {
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f60,f170,f171`;
  const data = await fetchJson<any>(url);

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
  const data = await fetchJson<any>(url);

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
  try {
    const [market, code] = secid.split('.');
    
    const period = kCode === 101 ? '240' : kCode === 102 ? '1440' : kCode === 103 ? '10080' : '240';
    const datalen = 100;
    
    const url = `https://quotes.sina.cn/cn/api/jsonp.php/IO.XSRV2.CallbackList['xxx']/CN_MarketDataService.getKLineData?symbol=${code}&scale=${period}&datalen=${datalen}`;
    const text = await fetchText(url);
    
    const match = text.match(/CN_MarketDataService\.getKLineData\((\[.*?\])\)/);
    if (!match) return [];
    
    const data: any[] = JSON.parse(match[1]);
    
    return data.map((item: any) => ({
      date: item.day,
      open: parseFloat(item.open),
      close: parseFloat(item.close),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      volume: parseFloat(item.volume),
      amount: 0,
    }));
  } catch (error) {
    console.error('GetKFromSina error:', error);
    return [];
  }
};

export const GetPicTrendFromEastmoney = async (secid: string): Promise<any> => {
  return {};
};

export const GetReportDate = async (): Promise<string[]> => {
  return ['2024-12-31', '2024-09-30', '2024-06-30', '2024-03-31'];
};

export const GetStockHoldFunds = async (secid: string, date: string): Promise<any[]> => {
  try {
    const [market, code] = secid.split('.');
    
    const timestamp = Date.now();
    const url = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&year=&month=&rt=0.${timestamp}`;
    const text = await fetchText(url);
    
    const stockMatch = text.match(/<table[^>]*class="w782"[^>]*>([\s\S]*?)<\/table>/);
    if (!stockMatch) return [];
    
    const rows = stockMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
    const result: any[] = [];
    
    for (const row of rows.slice(1, 11)) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
      if (cells.length >= 5) {
        const getText = (html: string) => {
          const textMatch = html.match(/<a[^>]*>([\s\S]*?)<\/a>/);
          if (textMatch) {
            return textMatch[1].replace(/<[^>]+>/g, '').trim();
          }
          return html.replace(/<[^>]+>/g, '').trim();
        };
        
        result.push({
          code: getText(cells[1]),
          name: getText(cells[2]),
          ratio: getText(cells[3]),
          shares: getText(cells[4]),
          value: getText(cells[5]),
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('GetStockHoldFunds error:', error);
    return [];
  }
};

export const GetABCompany = async (secid: string): Promise<Stock.Company> => {
  try {
    const [market, code] = secid.split('.');
    
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCI_CorpInfo/stockid/${code}.phtml`;
    const html = await fetchText(url);
    
    const getText = (label: string) => {
      const regex = new RegExp(`<td[^>]*>${label}[\\s\\S]*?<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, 'i');
      const match = html.match(regex);
      if (match) {
        return match[1].replace(/<[^>]+>/g, '').trim();
      }
      return '';
    };
    
    return {
      gsjs: getText('公司简介') || getText('英文简称'),
      sshy: getText('所属行业') || getText('行业类别'),
      dsz: getText('董事长') || '',
      zcdz: getText('注册地址') || getText('办公地址'),
      clrq: getText('成立日期') || '',
      ssrq: getText('上市日期') || '',
    };
  } catch (error) {
    console.error('GetABCompany error:', error);
    return {
      gsjs: '',
      sshy: '',
      dsz: '',
      zcdz: '',
      clrq: '',
      ssrq: '',
    };
  }
};

export const GetHKCompany = GetABCompany;
export const GetUSCompany = GetABCompany;
export const GetXSBCompany = GetABCompany;

export const GetMeetingData = async (params: {
  code: string;
  startTime: string;
  endTime: string;
}): Promise<any[]> => {
  try {
    const url = `https://vip.stock.finance.sina.com.cn/q/go.php/vIR_RawItem/index.phtml?symbol=${params.code}`;
    const html = await fetchText(url);
    
    const tableMatch = html.match(/<table[^>]*class="list"[^>]*>([\s\S]*?)<\/table>/);
    if (!tableMatch) return [];
    
    const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
    const result: any[] = [];
    
    for (const row of rows.slice(1)) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
      if (cells.length >= 3) {
        const getText = (html: string) => html.replace(/<[^>]+>/g, '').trim();
        
        result.push({
          date: getText(cells[0]),
          title: getText(cells[1]),
          type: getText(cells[2]),
        });
      }
    }
    
    return result.filter(item => {
      if (!params.startTime || !params.endTime) return true;
      return item.date >= params.startTime && item.date <= params.endTime;
    });
  } catch (error) {
    console.error('GetMeetingData error:', error);
    return [];
  }
};

export const GetCloseDayDates = async (): Promise<string[]> => {
  try {
    const year = new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const url = `http://query.sse.com.cn/commonCal.do?type=cal&begin=${startDate}&end=${endDate}`;
    const data = await fetchJson<any>(url);
    
    const result: string[] = [];
    if (data && data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.tradeType === '1' && item.date) {
          result.push(item.date);
        }
      }
    }
    
    return result.sort().reverse();
  } catch (error) {
    console.error('GetCloseDayDates error:', error);
    
    const year = new Date().getFullYear();
    const quarters = ['12-31', '09-30', '06-30', '03-31'];
    return quarters.map(q => `${year}-${q}`);
  }
};