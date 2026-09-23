export async function FetchPublic(
  endpoint: string,
  options: RequestInit = {}
) {
  const isProduction = import.meta.env.MODE === 'production';

  let baseUrl: string;
  if (isProduction) {
    baseUrl = import.meta.env.VITE_API_URL || '/sra/api';
  } else {
    baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }

  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api')) cleanEndpoint = cleanEndpoint.substring(4);
  if (!cleanEndpoint.startsWith('/')) cleanEndpoint = '/' + cleanEndpoint;

  const url = isProduction
    ? `${baseUrl}${cleanEndpoint}`
    : `${baseUrl}/api${cleanEndpoint}`;

  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  
  return res;
}