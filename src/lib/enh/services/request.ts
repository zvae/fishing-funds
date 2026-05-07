const isTauri = typeof window !== 'undefined' && !!window?.contextModules?.request;

export const request = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  if (isTauri) {
    return window.contextModules.request(url, options);
  }

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

export const fetchText = async (url: string): Promise<string> => {
  if (isTauri) {
    const response = await window.contextModules.request(url);
    if (typeof response === 'object' && 'body' in response) {
      const body = (response as any).body;
      return typeof body === 'string' ? body : JSON.stringify(body);
    }
    return typeof response === 'string' ? response : JSON.stringify(response);
  }
  return fetch(url).then((r) => r.text());
};

export const fetchJson = async <T = any>(url: string): Promise<T> => {
  if (isTauri) {
    const response = await window.contextModules.request(url);
    if (typeof response === 'object' && 'body' in response) {
      const body = (response as any).body;
      return typeof body === 'object' ? (body as T) : JSON.parse(body as string);
    }
    return response as T;
  }
  return fetch(url).then((r) => r.json());
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