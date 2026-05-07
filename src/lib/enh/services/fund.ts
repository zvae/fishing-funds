import { get, jsonp } from './request';

export const FromEastmoney = async (code: string): Promise<Fund.ResponseItem> => {
  const url = `https://fundgz.eastmoney.com/php/${code}.js`;
  const text = await fetch(url).then((r) => r.text());
  
  const match = text.match(/jsonpgz\((.*?)\)/);
  if (!match) throw new Error('Invalid response');
  
  const data = JSON.parse(match[1]);
  return {
    name: data.name,
    fundcode: data.fundcode,
    gztime: data.gztime,
    gszzl: data.gszzl,
    jzrq: data.jzrq,
    dwjz: data.dwjz,
    gsz: data.gsz,
  };
};

export const GetFixFromEastMoney = async (fundcode: string): Promise<Fund.FixData> => {
  const url = `https://fund.eastmoney.com/tzjs/${fundcode}.html`;
  const html = await fetch(url).then((r) => r.text());
  
  const fixNameMatch = html.match(/基金类型：(\w+)/);
  const fixZzlMatch = html.match(/日涨跌幅：(-?\d+\.\d+)%/);
  const fixDateMatch = html.match(/净值日期：(\d{4}-\d{2}-\d{2})/);
  const fixDwjzMatch = html.match(/单位净值：(\d+\.\d+)/);
  
  return {
    code: fundcode,
    fixName: fixNameMatch?.[1],
    fixZzl: fixZzlMatch?.[1],
    fixDate: fixDateMatch?.[1],
    fixDwjz: fixDwjzMatch?.[1],
  };
};

export const GetFundInfoByNameFromEaseMoney = async (name: string): Promise<Fund.ResponseItem> => {
  const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(name)}`;
  const data = await jsonp<any>(url);
  
  if (!data?.Datas?.length) throw new Error('Fund not found');
  
  const first = data.Datas[0];
  return FromEastmoney(first.CODE);
};

export const GetRemoteFundsFromEastmoney = async (): Promise<Fund.RemoteFund[]> => {
  const url = 'https://fund.eastmoney.com/js/fundcode_search.js';
  const text = await fetch(url).then((r) => r.text());
  
  const match = text.match(/var r = \[(.*?)\];/s);
  if (!match) return [];
  
  const data = eval(`[${match[1]}]`);
  return data;
};

export const GetFundRatingFromEasemoney = async (): Promise<Fund.RantingItem[]> => {
  const url = 'https://fund.eastmoney.com/data/fundrating.html';
  const html = await fetch(url).then((r) => r.text());
  
  const results: Fund.RantingItem[] = [];
  const regex = /<tr>.*?<td>(.*?)<\/td>.*?<td>(.*?)<\/td>.*?szStar.*?(\d+).*?zsStar.*?(\d+).*?jaStar.*?(\d+)/gs;
  
  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push({
      code: match[1],
      name: match[2],
      type: '',
      szStar: match[3],
      zsStar: match[4],
      jaStar: match[5],
      total: parseInt(match[3]) + parseInt(match[4]) + parseInt(match[5]),
    });
  }
  
  return results;
};

export const GetIndustryRateFromEaseMoney = async (code: string): Promise<{ stocks: any[]; expansion: string }> => {
  const url = `https://fund.eastmoney.com/data/fundshjl.php?code=${code}`;
  const text = await fetch(url).then((r) => r.text());
  
  const match = text.match(/var shjl_datas=(.*?);/);
  if (!match) return { stocks: [], expansion: '' };
  
  const data = eval(`(${match[1]})`);
  return {
    stocks: data.stocks || [],
    expansion: data.expansion || '',
  };
};

export const GetFundManagerDetailFromEastMoney = async (managerId: string): Promise<Fund.Manager.Info> => {
  const url = `https://fund.eastmoney.com/manager/${managerId}.html`;
  const html = await fetch(url).then((r) => r.text());
  
  const dataMatch = html.match(/var managerData = ({.*?});/);
  if (!dataMatch) throw new Error('Manager not found');
  
  return JSON.parse(dataMatch[1]);
};

export const GetFundDetailFromEastmoney = async (code: string): Promise<Fund.PingzhongData> => {
  const url = `https://fund.eastmoney.com/pingzhongdata/${code}.html`;
  const html = await fetch(url).then((r) => r.text());
  
  const data: Fund.PingzhongData = {};
  
  const stockCodesMatch = html.match(/var stockCodesNew = \[(.*?)\];/);
  if (stockCodesMatch) {
    data.stockCodesNew = stockCodesMatch[1].split(',').map((s) => s.replace(/"/g, '').trim());
  }
  
  const positionsMatch = html.match(/Data_fundSharesPositions\s*=\s*(\[.*?\]);/);
  if (positionsMatch) {
    data.Data_fundSharesPositions = JSON.parse(positionsMatch[1]);
  }
  
  return data;
};

export const GetStockWareHouseFromEastmoney = async (
  code: string,
  stockCodes: string[]
): Promise<Fund.WareHouse[]> => {
  const url = `https://fundf10.eastmoney.com/ccmx_${code}.html`;
  const html = await fetch(url).then((r) => r.text());
  
  const results: Fund.WareHouse[] = [];
  const regex = /<tr.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>/gs;
  
  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push({
      zxz: match[1],
      name: match[2],
      code: match[3],
      zdf: parseFloat(match[4]) || 0,
      ccb: match[4],
    });
  }
  
  return results;
};

export const GetSecuritiesWareHouseFromEastmoney = GetStockWareHouseFromEastmoney;

export const GetFundPerformanceFromEastmoney = async (code: string, type: number): Promise<any[]> => {
  const url = `https://fund.eastmoney.com/tenjijihua_${code}.html`;
  const html = await fetch(url).then((r) => r.text());
  
  return [];
};

export const GetInverstStyleFromEastmoney = async (code: string): Promise<any> => {
  const url = `https://fund.eastmoney.com/fundguzhizhang/${code}.html`;
  const html = await fetch(url).then((r) => r.text());
  
  return {};
};

export const GetEstimatedFromEastmoney = async (code: string): Promise<any> => {
  const url = `https://fundgz.eastmoney.com/php/${code}.js`;
  const text = await fetch(url).then((r) => r.text());
  
  const match = text.match(/jsonpgz\((.*?)\)/);
  if (!match) return null;
  
  return JSON.parse(match[1]);
};

export const GetRankDataFromEasemoney = async (type: string): Promise<string[]> => {
  const url = `https://fund.eastmoney.com/data/fundranking.html`;
  const html = await fetch(url).then((r) => r.text());
  
  return [];
};

export const GetAutomaticPlanFromEastmoney = async (type: string): Promise<any[]> => {
  return [];
};

export const GetTodayListFromEastmoney = async (type: string): Promise<any[]> => {
  return [];
};