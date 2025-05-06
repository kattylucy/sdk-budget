import fetch from 'cross-fetch';

export class HttpClient {
  constructor({ baseUrl, apiKey }) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey  = apiKey;
  }

  async request(path, { method = 'GET', body, params } = {}) {
    const url = new URL(this.baseUrl + path);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.status === 204 ? null : res.json();
  }
}
