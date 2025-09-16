export interface WebvizioProject {
  uuid: string;
  name: string;
}

export interface WebvizioTask {
  uuid: string;
  number: number;
  title: string;
  priority: string;
  createdAt: string;
  executeAt?: string;
  tags?: string[];
}

export interface WebvizioSetProjectRequest {
  uuid: string;
}

export interface WebvizioGetTaskRequest {
  uuid: string;
}

export interface McpError {
  code: number;
  message: string;
  details?: any;
} 