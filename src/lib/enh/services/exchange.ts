interface ExchangeResponse {
  code: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
}

export const GetListFromEastmoney = async (
  type: string,
  params: string
): Promise<Exchange.ResponseItem[]> => {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=100&fs=${params}&fields=f12,f14,f2,f3,f4,f15,f16`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    price: item.f2,
    change: item.f4,
    changePercent: item.f3,
  }));
};

export const GetGlobalBondFromEastmoney = async (): Promise<Exchange.ResponseItem[]> => {
  const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&fs=b:MK0401&fields=f12,f14,f2,f3,f4';
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.data?.diff) return [];
  
  return data.data.diff.map((item: any) => ({
    code: item.f12,
    name: item.f14,
    price: item.f2,
    change: item.f4,
    changePercent: item.f3,
  }));
};