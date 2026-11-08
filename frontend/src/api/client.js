// API client supporting both real FastAPI backend calls and offline mock mode

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let simulateError = false;

export function setSimulateApiError(val) {
  simulateError = Boolean(val);
}

export function isSimulateApiError() {
  return simulateError;
}

export async function mockFetch(dataGenerator, delayMs = 150) {
  await new Promise((res) => setTimeout(res, delayMs));

  if (simulateError) {
    throw new Error('Simulated network communication timeout (503 Service Unavailable).');
  }

  return typeof dataGenerator === 'function' ? dataGenerator() : dataGenerator;
}

/**
 * Executes an HTTP fetch call against the FastAPI backend.
 * Automatically attaches the Bearer token from localStorage and logs out on 401.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = localStorage.getItem('floodwatch_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new Error(`Failed to connect to JalSetuAI backend (${url}). Verify server is running.`);
  }

  // Auto-logout on 401
  if (response.status === 401) {
    localStorage.removeItem('floodwatch_token');
    window.dispatchEvent(new Event('floodwatch:unauthorized'));
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || 'Authentication session has expired. Please sign in again.';
    throw new Error(message);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `API request failed with status ${response.status}.`;
    const err = new Error(message);
    err.status = response.status;
    err.code = errData?.error?.code || 'API_ERROR';
    throw err;
  }

  return response.json();
}
