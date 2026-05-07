import { fetchJson } from './request';

export const GetRemoteCoinsFromCoingecko = async (): Promise<Coin.RemoteCoin[]> => {
  const url = 'https://api.coingecko.com/api/v3/coins/list';
  const data = await fetchJson<any>(url);

  return data.map((item: any) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.name,
  }));
};

export const GetDetailFromCoingecko = async (code: string): Promise<Coin.DetailItem> => {
  const url = `https://api.coingecko.com/api/v3/coins/${code}`;
  const data = await fetchJson<any>(url);

  return {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    price: data.market_data.current_price.usd,
    change24h: data.market_data.price_change_percentage_24h,
    vol24h: data.market_data.total_volume.usd,
  };
};

export const FromCoingecko = async (
  ids: string,
  unit: string
): Promise<Coin.ResponseItem[]> => {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${unit}&ids=${ids}&order=market_cap_desc&sparkline=false`;
  const data = await fetchJson<any>(url);

  return data.map((item: any) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    price: item.current_price,
    change24h: item.price_change_percentage_24h,
    vol24h: item.total_volume,
  }));
};

export const GetHistoryFromCoingecko = async (
  code: string,
  unit: string,
  date: string
): Promise<any[]> => {
  const url = `https://api.coingecko.com/api/v3/coins/${code}/market_chart?vs_currency=${unit}&days=${date}`;
  const data = await fetchJson<any>(url);

  return data.prices.map((item: any[]) => ({
    timestamp: item[0],
    price: item[1],
  }));
};

export const GetKFromCoingecko = async (
  code: string,
  unit: string,
  date: string
): Promise<any[]> => {
  const url = `https://api.coingecko.com/api/v3/coins/${code}/ohlc?vs_currency=${unit}&days=${date}`;
  const data = await fetchJson<any>(url);

  return data.map((item: any[]) => ({
    timestamp: item[0],
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4],
  }));
};

export const FromCoinCap = async (
  ids: string,
  unit: string
): Promise<Coin.ResponseItem[]> => {
  const url = `https://api.coincap.io/v2/assets?ids=${ids}`;
  const data = await fetchJson<any>(url);

  return data.data.map((item: any) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    price: parseFloat(item.priceUsd),
    change24h: parseFloat(item.changePercent24Hr),
    vol24h: parseFloat(item.volumeUsd24Hr),
  }));
};