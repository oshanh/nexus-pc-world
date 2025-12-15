const API_BASE_URL = 'http://localhost:5000/api';

export const client = {
  get: async (endpoint: string) => {
    // Use credentials: 'include' so httpOnly cookies are sent with requests
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
  _csrfToken: '' as string,
  _getCsrfToken: async function() {
    if (this._csrfToken) return this._csrfToken;
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch CSRF token');
    const data = await res.json();
    this._csrfToken = data.csrfToken;
    return this._csrfToken;
  },
  post: async (endpoint: string, data: any) => {
    const csrfToken = await client._getCsrfToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
  put: async (endpoint: string, data: any) => {
    const csrfToken = await client._getCsrfToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
  delete: async (endpoint: string) => {
    const csrfToken = await client._getCsrfToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrfToken }
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
};
