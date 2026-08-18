const isLoginRoute = () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return [
    '/sra/sign-in',
  ].includes(path);
};

const redirectToLogin = () => {
  if (isLoginRoute()) return;
  const loginUrl = new URL('/sra/sign-in', window.location.origin).toString();
  window.location.assign(loginUrl);
};

export async function FetchDynamic(
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

  if (res.status === 401) {
    redirectToLogin();
    return res;
  }

  return res;
}



export async function FetchDynamicParams(
  endpoint: string,
  options: RequestInit = {},
  params?: Record<string, any> // 👈 Nuevo parámetro
) {
  const isProduction = import.meta.env.MODE === 'production';

  let baseUrl: string;
  if (isProduction) {
    baseUrl = import.meta.env.VITE_API_URL || '/sra/api';
  } else {
    baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  }

  // ✅ Construir URL con parámetros
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api')) cleanEndpoint = cleanEndpoint.substring(4);
  if (!cleanEndpoint.startsWith('/')) cleanEndpoint = '/' + cleanEndpoint;

  // ✅ Agregar parámetros de consulta si existen
  let fullEndpoint = cleanEndpoint;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    fullEndpoint = `${cleanEndpoint}?${queryString}`;
  }

  const url = isProduction
    ? `${baseUrl}${fullEndpoint}`
    : `${baseUrl}/api${fullEndpoint}`;


  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    redirectToLogin();
    return res;
  }

  return res;
}