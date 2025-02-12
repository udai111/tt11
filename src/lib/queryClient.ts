import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    // In production, use Netlify functions
    return '/.netlify/functions/api';
  }
  // In development, use local server
  return '/api';
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;
  console.log(`Making ${method} request to:`, fullUrl);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const baseUrl = getApiBaseUrl();
      const fullUrl = `${baseUrl}${queryKey[0]}`;
      console.log('Making query to:', fullUrl);

      try {
        const res = await fetch(fullUrl, {
          credentials: "include",
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          console.log('Unauthorized request, returning null as configured');
          return null;
        }

        await throwIfResNotOk(res);
        const data = await res.json();
        console.log('Query response:', data);
        return data;
      } catch (error) {
        console.error('Query failed:', error);
        throw error;
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});