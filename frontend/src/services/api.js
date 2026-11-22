const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Custom error object for API failures.
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {Array<{field?: string, message: string}>} [errors=[]]
   */
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Core fetch wrapper escape hatch.
 *
 * @param {string} endpoint - Path relative to BASE_URL or full URL
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>}
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  const headers = new Headers(options.headers || {});

  // Sets Content-Type: application/json unless the body is FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config = {
    ...options,
    headers,
    // Always sends credentials: "include"
    credentials: 'include',
  };

  const response = await fetch(url, config);

  // Parses JSON only when the response has a JSON content type and a non-empty body;
  // otherwise returns null.
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const rawText = await response.text();
    if (rawText && rawText.trim().length > 0) {
      try {
        data = JSON.parse(rawText);
      } catch (_parseError) {
        data = null;
      }
    }
  }

  // Throws a typed error object { message, status, errors } on non-2xx responses
  if (!response.ok) {
    const message = data?.message || response.statusText || 'Request failed';
    const errors = data?.errors || [];
    throw new ApiError(message, response.status, errors);
  }

  return data;
}

/**
 * Convenience methods for HTTP verbs.
 */
export const api = {
  request,

  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body = null, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData || body === null ? body : JSON.stringify(body),
    });
  },

  put(endpoint, body = null, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData || body === null ? body : JSON.stringify(body),
    });
  },

  patch(endpoint, body = null, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData || body === null ? body : JSON.stringify(body),
    });
  },

  del(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default api;
