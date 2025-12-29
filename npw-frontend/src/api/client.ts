/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: 'include' });
    if (!response.ok) {
      const errorMsg = await parseErrorResponse(response);
      if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    return response.json();
  },
  _csrfToken: '' as string,
  _getCsrfToken: async function() {
    if (this._csrfToken) return this._csrfToken;
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
    if (!res.ok) {
      const errorMsg = await parseErrorResponse(res);
      throw new Error(`Failed to fetch CSRF token: ${errorMsg}`);
    }
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
      const errorMsg = await parseErrorResponse(response);
      // On CSRF failure (403), clear cached token so next request refetches it
      if (response.status === 403) {
        client._csrfToken = '';
        throw new Error(`CSRF token invalid. Please retry: ${errorMsg}`);
      }
      if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    return response.json();
  },
  postForm: async (endpoint: string, formData: FormData) => {
    const csrfToken = await client._getCsrfToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrfToken },
      body: formData,
    });
    if (!response.ok) {
      const errorMsg = await parseErrorResponse(response);
      if (response.status === 403) {
        client._csrfToken = '';
        throw new Error(`CSRF token invalid. Please retry: ${errorMsg}`);
      }
      if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
      throw new Error(errorMsg);
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
      const errorMsg = await parseErrorResponse(response);
      // On CSRF failure (403), clear cached token so next request refetches it
      if (response.status === 403) {
        client._csrfToken = '';
        throw new Error(`CSRF token invalid. Please retry: ${errorMsg}`);
      }
      if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
      throw new Error(errorMsg);
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
      const errorMsg = await parseErrorResponse(response);
      // On CSRF failure (403), clear cached token so next request refetches it
      if (response.status === 403) {
        client._csrfToken = '';
        throw new Error(`CSRF token invalid. Please retry: ${errorMsg}`);
      }
      if (response.status === 401) throw new Error(`Unauthorized: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    return response.json();
  },
};
