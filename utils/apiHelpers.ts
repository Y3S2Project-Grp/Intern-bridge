// utils/apiHelpers.ts

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiHelpers = {
  // Handle API responses
  handleResponse: async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status);
    }
    
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new ApiError('Invalid JSON response');
    }
  },
  
  // Create headers for API requests
  createHeaders: (options?: {
    contentType?: string;
    authToken?: string;
    additionalHeaders?: Record<string, string>;
  }): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': options?.contentType || 'application/json',
    };
    
    if (options?.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`;
    }
    
    if (options?.additionalHeaders) {
      Object.assign(headers, options.additionalHeaders);
    }
    
    return headers;
  },
  
  // Generic GET request
  get: async <T>(
    url: string,
    options?: {
      headers?: HeadersInit;
      authToken?: string;
    }
  ): Promise<T> => {
    const response = await fetch(url, {
      method: 'GET',
      headers: apiHelpers.createHeaders({
        authToken: options?.authToken,
        additionalHeaders: options?.headers,
      }),
    });
    
    return apiHelpers.handleResponse<T>(response);
  },
  
  // Generic POST request
  post: async <T>(
    url: string,
    data?: any,
    options?: {
      headers?: HeadersInit;
      authToken?: string;
      contentType?: string;
    }
  ): Promise<T> => {
    const body = options?.contentType === 'multipart/form-data' 
      ? data 
      : JSON.stringify(data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: apiHelpers.createHeaders({
        contentType: options?.contentType === 'multipart/form-data' 
          ? undefined 
          : 'application/json',
        authToken: options?.authToken,
        additionalHeaders: options?.headers,
      }),
      body,
    });
    
    return apiHelpers.handleResponse<T>(response);
  },
  
  // Generic PUT request
  put: async <T>(
    url: string,
    data?: any,
    options?: {
      headers?: HeadersInit;
      authToken?: string;
    }
  ): Promise<T> => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: apiHelpers.createHeaders({
        authToken: options?.authToken,
        additionalHeaders: options?.headers,
      }),
      body: JSON.stringify(data),
    });
    
    return apiHelpers.handleResponse<T>(response);
  },
  
  // Generic DELETE request
  delete: async <T>(
    url: string,
    options?: {
      headers?: HeadersInit;
      authToken?: string;
    }
  ): Promise<T> => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: apiHelpers.createHeaders({
        authToken: options?.authToken,
        additionalHeaders: options?.headers,
      }),
    });
    
    return apiHelpers.handleResponse<T>(response);
  },
  
  // Handle errors in components
  handleError: (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  },
};

export default apiHelpers;