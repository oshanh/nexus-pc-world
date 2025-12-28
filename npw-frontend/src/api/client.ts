/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to parse error response
const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data.message || data.error || response.statusText;
  } catch {
    return response.statusText;
  }
};

export const client = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: 'include' });
      if (!response.ok) {
        const errorMsg = await parseErrorResponse(response);
        if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }
      return response.json();
    } catch (err) {
      throw err;
    }
  },
  _csrfToken: '' as string,
  _getCsrfToken: async function() {
    if (this._csrfToken) return this._csrfToken;
    try {
      const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
      if (!res.ok) {
        const errorMsg = await parseErrorResponse(res);
        throw new Error(`Failed to fetch CSRF token: ${errorMsg}`);
      }
      const data = await res.json();
      this._csrfToken = data.csrfToken;
      return this._csrfToken;
    } catch (err) {
      throw err;
    }
  },
  post: async (endpoint: string, data: any) => {
    const csrfToken = await client._getCsrfToken();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorMsg = await parseErrorResponse(response);
        // On CSRF failure (403), clear cached token so next request refetches it
        if (response.status === 403) {
          client._csrfToken = '';
          throw new Error(`CSRF token invalid. Please retry: ${errorMsg}`);
        }
        if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }
      return response.json();
    } catch (err) {
      throw err;
    }
  },
  put: async (endpoint: string, data: any) => {
    const csrfToken = await client._getCsrfToken();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorMsg = await parseErrorResponse(response);
        // On CSRF failure (403), clear cached token so next request refetches it
        if (response.status === 403) {
          client._csrfToken = '';
          throw new Error(`CSRF token invalid. Please retry: ${errorMsg}`);
        }
        if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }
      return response.json();
    } catch (err) {
      throw err;
    }
  },
  delete: async (endpoint: string) => {
    const csrfToken = await client._getCsrfToken();
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      if (!response.ok) {
        const errorMsg = await parseErrorResponse(response);
        // On CSRF failure (403), clear cached token so next request refetches it
        if (response.status === 403) {
          client._csrfToken = '';
          throw new Error(`CSRF token invalid. Please retry: ${errorMsg}`);
        }
        if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }
      return response.json();
    } catch (err) {
      throw err;
    }
  },
};
