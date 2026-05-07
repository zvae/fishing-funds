export const GetCurrentDateTimeFromTaobao = async (): Promise<string> => {
  const response = await fetch(
    'http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp'
  );
  const data = await response.json();
  return data.data.t;
};

export const GetCurrentDateTimeFromSuning = async (): Promise<string> => {
  const response = await fetch(
    'https://quan.suning.com/getSysTime.do'
  );
  const data = await response.json();
  return data.sysTime1;
};