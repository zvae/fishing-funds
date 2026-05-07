export const GetRecent = async (
  keyword: string,
  pageIndex: number,
  filter?: Enums.NewsFilterType
): Promise<{ total: number; list: any[] }> => {
  const url = `https://searchapi.eastmoney.com/news/json.jsp?keyword=${encodeURIComponent(keyword)}&pageindex=${pageIndex}&pagesize=20`;
  const data = await fetch(url).then((r) => r.json());
  
  return {
    total: data.total || 0,
    list: (data.list || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      showtime: item.showtime,
      source: item.source,
    })),
  };
};

export const GetLiveList = async (): Promise<News.ResponseItem[]> => {
  const url = 'https://np-listapi.eastmoney.com/comm/web/getFastNewsList?type=106&pagesize=20';
  const data = await fetch(url).then((r) => r.json());
  
  return (data.data?.fastNewsList || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    url_unique: item.url_unique,
    showtime: item.showtime,
    source: item.source,
  }));
};

export const GetUsaList = async (): Promise<News.ResponseItem[]> => {
  const url = 'https://np-listapi.eastmoney.com/comm/web/getNewsByType?type=100&pagesize=20';
  const data = await fetch(url).then((r) => r.json());
  
  return (data.data?.newsList || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    url_unique: item.url_unique,
    showtime: item.showtime,
    source: item.source,
  }));
};

export const GetJpList = GetUsaList;
export const GetUkList = GetUsaList;
export const GetEuList = GetUsaList;
export const GetGlobalList = GetUsaList;
export const GetChinaList = GetUsaList;
export const GetExchangeList = GetUsaList;
export const GetBondList = GetUsaList;
export const GetFundList = GetUsaList;
export const GetFocusList = GetUsaList;
export const GetListedList = GetUsaList;
export const GetGoodsList = GetUsaList;

export const GetGuBaList = async (keyword: string, type: string): Promise<any[]> => {
  const url = `https://searchapi.eastmoney.com/bussiness/web/QuotationLabelSearch?keyword=${encodeURIComponent(keyword)}`;
  const data = await fetch(url).then((r) => r.json());
  
  return (data.QuotationLabelSearch?.returnData?.datas || []).map((item: any) => ({
    code: item.Code,
    name: item.Name,
  }));
};