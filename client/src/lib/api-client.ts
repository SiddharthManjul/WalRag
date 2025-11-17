/**
 * API Client with automatic authentication headers
 * Includes user context in all requests
 */

import { zkLoginService } from '@/services/zklogin-service';

export interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Fetch with automatic authentication headers
 */
export async function apiFetch(url: string, options: ApiOptions = {}): Promise<Response> {
  const { requireAuth = true, ...fetchOptions } = options;

  // Get current authenticated user
  const account = zkLoginService.getCurrentAccount();

  if (requireAuth && !account) {
    throw new Error('Authentication required. Please login first.');
  }

  // Add authentication headers
  const headers = new Headers(fetchOptions.headers);

  if (account) {
    headers.set('x-user-address', account.userAddr);
    if (account.email) {
      headers.set('x-user-email', account.email);
    }
    if (account.name) {
      headers.set('x-user-name', account.name);
    }
  }

  // Make request with auth headers
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  return response;
}

/**
 * POST request with JSON body and authentication
 */
export async function apiPost<T = any>(
  url: string,
  body: any,
  options: ApiOptions = {}
): Promise<T> {
  const response = await apiFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * GET request with authentication
 */
export async function apiGet<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const response = await apiFetch(url, {
    ...options,
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
