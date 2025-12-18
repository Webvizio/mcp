import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import { WebvizioConfig } from './config.js';
import {
  WebvizioProject,
  WebvizioTask,
  WebvizioSetProjectRequest,
  WebvizioGetTaskRequest,
  McpError
} from './types.js';

export class WebvizioClient {
  private client: AxiosInstance;

  constructor(private config: WebvizioConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000, // 30 seconds timeout
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error('[Webvizio API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const mcpError = this.handleApiError(error);
        return Promise.reject(mcpError);
      }
    );
  }

  /**
   * Fetch all projects
   */
  async getProjects(): Promise<WebvizioProject[]> {
    try {
      const response = await this.client.get('/projects');
      if (!response.data) {
        throw new Error(response.data.error || 'Failed to fetch projects');
      }
      return response.data;
    } catch (error) {
      console.error('[Webvizio API] Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Fetch current project details
   */
  async getCurrentProject(): Promise<WebvizioProject> {
    try {
      const response = await this.client.get('/current-project');
      
      if (!response.data) {
        throw new Error('Failed to fetch current project');
      }

      return response.data;
    } catch (error) {
      console.error('[Webvizio API] Error fetching current project:', error);
      throw error;
    }
  }

  /**
   * Set the current project
   */
  async setProject(request: WebvizioSetProjectRequest): Promise<boolean> {
    try {
      const response = await this.client.post('/set-project', request);
      
      if (!response.data) {
        throw new Error('Failed to set project');
      }

      return response.data;
    } catch (error) {
      console.error('[Webvizio API] Error setting project:', error);
      throw error;
    }
  }

  /**
   * Get the prompt for a task
   */
  async getTaskPrompt(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.get(`/task/${request.uuid}/prompt`);
      if (!response.data?.prompt) {
        throw new Error('Failed to get task prompt');
      }

      return response.data.prompt;
    } catch (error) {
      console.error('[Webvizio API] Error getting task prompt:', error);
      throw error;
    }
  }

  async getTaskDescription(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.get(`/task/${request.uuid}`);
      if (!response.data?.description) {
        throw new Error('Failed to get task description');
      }
      return response.data.description;
    } catch (error) {
      console.error('[Webvizio API] Error getting task description:', error);
      throw error;
    }
  }

  async getTaskConsoleLogs(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.get(`/task/${request.uuid}/console-logs`);
      if (!response.data?.prompt) {
        throw new Error('Failed to get console logs prompt');
      }

      return response.data.prompt;
    } catch (error) {
      console.error('[Webvizio API] Error getting console logs prompt:', error);
      throw error;
    }
  }

  async getTaskNetworkLogs(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.get(`/task/${request.uuid}/network-logs`);
      if (!response.data?.prompt) {
        throw new Error('Failed to get network logs prompt');
      }

      return response.data.prompt;
    } catch (error) {
      console.error('[Webvizio API] Error getting network logs prompt:', error);
      throw error;
    }
  }

  async getTaskActionLogs(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.get(`/task/${request.uuid}/action-logs`);
      if (!response.data?.prompt) {
        throw new Error('Failed to get action logs prompt');
      }

      return response.data.prompt;
    } catch (error) {
      console.error('[Webvizio API] Error getting action logs prompt:', error);
      throw error;
    }
  }

  async getTaskErrorLogs(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.get(`/task/${request.uuid}/error-logs`);
      if (!response.data?.prompt) {
        throw new Error('Failed to get error logs prompt');
      }

      return response.data.prompt;
    } catch (error) {
      console.error('[Webvizio API] Error getting error logs prompt:', error);
      throw error;
    }
  }

   async getTaskScreenshot(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.get(`/task/${request.uuid}/screenshot`);
      if (!response.data?.screenshot) {
        throw new Error('Failed to get task screenshot');
      }
      const imageResponse = await axios.get(response.data.screenshot, {
        responseType: 'arraybuffer'
      });
      const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
      return base64Image;
    } catch (error) {
      console.error('[Webvizio API] Error getting task screenshot:', error);
      throw error;
    }
  }

  async closeTask(request: WebvizioGetTaskRequest): Promise<string> {
    try {
      const response = await this.client.post(`/task/${request.uuid}/close`);
      return response.data.success;
    } catch (error) {
      console.error('[Webvizio API] Error closing task:', error);
      throw error;
    }
  }

  /**
   * Fetch tasks for the current project
   */
  async getTasks(): Promise<WebvizioTask[] | boolean> {
    try {
      const response = await this.client.get('/tasks');
      
      if (!response.data) {
        throw new Error('Failed to fetch tasks');
      }

      return response.data;
    } catch (error) {
      console.error('error object');
      console.error(error);
      if (this.isMcpError(error) && error.details?.message === 'Project not found') {
        return false;
      }
      console.error('[Webvizio API] Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Check if an error is an MCP error
   */
  private isMcpError(error: any): error is McpError {
    return error && typeof error === 'object' && 'code' in error && 'message' in error;
  }

  /**
   * Handle API errors and convert them to MCP errors
   */
  private handleApiError(error: AxiosError): McpError {
    console.error('[Webvizio API] API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;
      
      switch (status) {
        case 401:
          return {
            code: 401,
            message: 'Unauthorized: Invalid or missing API key',
            details: data
          };
        case 403:
          return {
            code: 403,
            message: 'Forbidden: Access denied',
            details: data
          };
        case 404:
          return {
            code: 404,
            message: 'Not Found: Resource not found',
            details: data
          };
        case 429:
          return {
            code: 429,
            message: 'Rate Limit Exceeded: Too many requests',
            details: data
          };
        case 500:
          return {
            code: 500,
            message: 'Internal Server Error: Webvizio API error',
            details: data
          };
        default:
          return {
            code: status,
            message: data?.message || data?.error || `HTTP ${status}: ${error.response.statusText}`,
            details: data
          };
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        code: 0,
        message: 'Network Error: Unable to reach Webvizio API',
        details: { originalError: error.message }
      };
    } else {
      // Something else happened
      return {
        code: -1,
        message: `Request Error: ${error.message}`,
        details: { originalError: error.message }
      };
    }
  }
} 