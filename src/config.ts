import dotenv from 'dotenv';

dotenv.config();

export interface WebvizioConfig {
  apiKey: string;
  baseUrl: string;
}

export function getConfig(): WebvizioConfig {
  const apiKey = process.env.WEBVIZIO_API_KEY;
  
  if (!apiKey) {
    throw new Error('WEBVIZIO_API_KEY environment variable is required');
  }
  
  const baseUrl = 'https://app.webvizio.com/api/mcp/v1/';

  return {
    apiKey,
    baseUrl
  };
} 