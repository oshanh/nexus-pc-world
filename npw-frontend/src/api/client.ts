/// <reference types="vite/client" />

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; 

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper to parse error response
const parseErrorResponse = async (
  response: Response
): Promise<{ message: string; data?: any }> => {
  try {
    const data = await response.json();
    return { message: data.message || data.error || response.statusText, data };
  } catch {
    return { message: response.statusText };
  }
};

export const client = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: 'include' });
    if (!response.ok) {
      const parsed = await parseErrorResponse(response);
      const errorMsg = parsed.message;
      if (response.status === 401) throw new ApiError(`Unauthorized: ${errorMsg}`, response.status, parsed.data);
      throw new ApiError(errorMsg, response.status, parsed.data);
    }
    return response.json();
  },
  _csrfToken: '' as string,
  _getCsrfToken: async function() {
    if (this._csrfToken) return this._csrfToken;
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
    if (!res.ok) {
      const parsed = await parseErrorResponse(res);
      throw new ApiError(`Failed to fetch CSRF token: ${parsed.message}`, res.status, parsed.data);
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
      const parsed = await parseErrorResponse(response);
      const errorMsg = parsed.message;
      // On CSRF failure (403), clear cached token so next request refetches it
      if (response.status === 403) {
        client._csrfToken = '';
        throw new ApiError(`CSRF token invalid. Please retry: ${errorMsg}`, response.status, parsed.data);
      }
      if (response.status === 401) throw new ApiError(`Unauthorized: ${errorMsg}`, response.status, parsed.data);
      throw new ApiError(errorMsg, response.status, parsed.data);
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
      const parsed = await parseErrorResponse(response);
      const errorMsg = parsed.message;
      if (response.status === 403) {
        client._csrfToken = '';
        throw new ApiError(`CSRF token invalid. Please retry: ${errorMsg}`, response.status, parsed.data);
      }
      if (response.status === 401) throw new ApiError(`Unauthorized: ${errorMsg}`, response.status, parsed.data);
      throw new ApiError(errorMsg, response.status, parsed.data);
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
      const parsed = await parseErrorResponse(response);
      const errorMsg = parsed.message;
      // On CSRF failure (403), clear cached token so next request refetches it
      if (response.status === 403) {
        client._csrfToken = '';
        throw new ApiError(`CSRF token invalid. Please retry: ${errorMsg}`, response.status, parsed.data);
      }
      if (response.status === 401) throw new ApiError(`Unauthorized: ${errorMsg}`, response.status, parsed.data);
      throw new ApiError(errorMsg, response.status, parsed.data);
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
      const parsed = await parseErrorResponse(response);
      const errorMsg = parsed.message;
      // On CSRF failure (403), clear cached token so next request refetches it
      if (response.status === 403) {
        client._csrfToken = '';
        throw new ApiError(`CSRF token invalid. Please retry: ${errorMsg}`, response.status, parsed.data);
      }
      if (response.status === 401) throw new ApiError(`Unauthorized: ${errorMsg}`, response.status, parsed.data);
      throw new ApiError(errorMsg, response.status, parsed.data);
    }
    return response.json();
  },
};
