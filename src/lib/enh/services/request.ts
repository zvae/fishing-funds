const request = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const get = async <T = any>(url: string): Promise<T> => {
  return request<T>(url);
};

export const jsonp = async <T = any>(url: string, callbackName?: string): Promise<T> => {
  const cb = callbackName || `jsonp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${cb}`;
    
    (window as any)[cb] = (data: T) => {
      delete (window as any)[cb];
      document.head.removeChild(script);
      resolve(data);
    };
    
    script.onerror = () => {
      delete (window as any)[cb];
      document.head.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    document.head.appendChild(script);
  });
};