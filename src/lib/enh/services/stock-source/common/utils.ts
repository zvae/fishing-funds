export function convertToTencentCode(code: string, market?: string): string {
  if (code.includes('sh') || code.includes('sz') || code.includes('hk') || code.includes('us')) {
    return code;
  }
  
  const prefix = code.startsWith('6') ? 'sh' : code.startsWith('0') || code.startsWith('3') ? 'sz' : market || 'sh';
  return `${prefix}${code}`;
}

export function convertToSinaCode(code: string, market?: string): string {
  if (code.includes('sh') || code.includes('sz') || code.includes('hk') || code.includes('gb_')) {
    return code;
  }
  
  const prefix = code.startsWith('6') ? 'sh' : code.startsWith('0') || code.startsWith('3') ? 'sz' : market || 'sh';
  return `${prefix}${code}`;
}

export function convertToEastmoneyCode(code: string, market?: string): string {
  if (code.includes('.')) {
    return code;
  }
  
  const marketCode = code.startsWith('6') ? '1' : code.startsWith('0') || code.startsWith('3') ? '0' : market || '1';
  return `${marketCode}.${code}`;
}

export function parseGBKText(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('gbk');
  return decoder.decode(new Uint8Array(buffer));
}

export function parseStockCodeFromMarket(code: string): { market: string; code: string } {
  if (code.includes('.')) {
    const [market, stockCode] = code.split('.');
    return { market, code: stockCode };
  }
  
  if (code.startsWith('sh')) {
    return { market: 'sh', code: code.substring(2) };
  } else if (code.startsWith('sz')) {
    return { market: 'sz', code: code.substring(2) };
  } else if (code.startsWith('hk')) {
    return { market: 'hk', code: code.substring(2) };
  } else if (code.startsWith('us') || code.startsWith('gb_')) {
    return { market: 'us', code: code.replace(/^(us|gb_)/, '') };
  }
  
  const market = code.startsWith('6') ? 'sh' : code.startsWith('0') || code.startsWith('3') ? 'sz' : 'sh';
  return { market, code };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}