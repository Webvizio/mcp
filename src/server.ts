import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebvizioClient } from './webvizio-client.js';
import { WebvizioConfig } from './config.js';
import { McpError, WebvizioSetProjectRequest } from './types.js';
import { z } from 'zod';

export class WebvizioMcpServer {
  private server: McpServer;
  private webvizioClient: WebvizioClient;

  constructor(config: WebvizioConfig) {
    this.webvizioClient = new WebvizioClient(config);
    this.server = new McpServer({
      name: 'Webvizio MCP Dev',
      version: '1.0.0',
      description: 'Webvizio MCP server',
      author: 'Webvizio Team',
      homepage: 'https://webvizio.com',
      repository: 'https://github.com/Webvizio/mcp'
    }, {
      instructions:
        "Use this server to manage user tasks and projects in Webvizio. It provides comprehensive information about user tasks to help you complete them efficiently.",
    });

    this.setupTools();
  }

  private setupTools(): void {
    // Register get_projects tool
    this.server.registerTool(
      'get_projects',
      {
        description: 'Fetch all available Webvizio projects',
        annotations: {
          title: 'Get Projects'
        }
      },
      async () => {
        try {
          const projects = await this.webvizioClient.getProjects();
          return {
            content: [
              {
                type: 'text' as const,
                text: `Found ${projects.length} projects:\n\n${JSON.stringify(projects, null, 2)}`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_projects');
        }
      }
    );

    // Register get_current_project tool
    this.server.registerTool(
      'get_current_project',
      {
        description: 'Fetch details of the currently selected Webvizio project',
        annotations: {
          title: 'Get Current Project'
        }
      },
      async () => {
        try {
          const currentProject = await this.webvizioClient.getCurrentProject();
          return {
            content: [
              {
                type: 'text' as const,
                text: `Current project details:\n\n${JSON.stringify(currentProject, null, 2)}`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_current_project');
        }
      }
    );

    // Register set_project tool
    this.server.registerTool(
      'set_project',
      {
        description: 'Set the current Webvizio project',
        inputSchema: {
          uuid: z.string().describe('The uuid of the project to set as current')
        },
        annotations: {
          title: 'Set Project'
        }
      },
      async (args: { uuid: string }) => {
        try {
          if (!args.uuid) {
            throw new Error('project uuid is required');
          }

          const request: WebvizioSetProjectRequest = {
            uuid: args.uuid
          };

          const success = await this.webvizioClient.setProject(request);
          
          return {
            content: [
              {
                type: 'text' as const,
                text: success 
                  ? `Successfully set project ${args.uuid} as current`
                  : `Failed to set project ${args.uuid} as current`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'set_project');
        }
      }
    );

    // Register get_tasks tool
    this.server.registerTool(
      'get_tasks',
      {
        description: "Fetches the users task list. Use this tool if a user asks to see their tasks. You should also use it if the user wants to execute a specific task but you don't have its UUID to use with the get_task_prompt tool. Display received tasks as <task number>: <title>. For example, 123: Prepare Q2 Report. Do not show the UUID.",
        annotations: {
          title: 'Get Tasks'
        }
      },
      async () => {
        try {
          const tasks = await this.webvizioClient.getTasks();
          if (!tasks || typeof tasks === 'boolean') {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: 'No project selected. You need to get the list of projects via get_projects tool select the uuid of the required project and set it using set_project tool'
                }
              ]
            };
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: `Found ${tasks.length} tasks:\n\n${JSON.stringify(tasks, null, 2)}`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_tasks');
        }
      }
    );

    this.server.registerTool(
      'get_task_description',
      {
        description: 'Fetches the task description. Use this tool only if the user ask you to provide the task description. If you need information for task execution, use get_task_prompt tool instead', 
        inputSchema: {
          uuid: z.string().describe('The uuid of the task to get the description for')
        },
        annotations: {
          title: 'Get Task Description'
        }
      },
      async (args: { uuid: string }) => {
        try {
          const description = await this.webvizioClient.getTaskDescription({ uuid: args.uuid });
          return {
            content: [
              {
                type: 'text' as const,  
                text: `Task description:\n\n${description}`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_task_description');
        }
      }
    );

    // Register get_task_prompt tool
    this.server.registerTool(
      'get_task_prompt',
      {
        description: 'Fetches the task prompt that includes a description of the task and relevant technical data to facilitate proper understanding and execution. You should use this tool whenever a user requests the execution of a specific task, by name, number, or by providing a link such as “https://app.webvizio.com/task/8ad64d4a-176a-41a0-9e4a-d20adcf25da3/show.” In cases where a link is provided, extract the UUID from the URL to retrieve the corresponding task prompt. If you are unable to obtain the UUID based on the task’s title or number, use the get_tasks tool to retrieve a list of all available tasks.', 
        inputSchema: {
          uuid: z.string().describe('The uuid of the task to get the prompt for')
        },
        annotations: {
          title: 'Get Task Prompt'
        }
      },
      async (args: { uuid: string }) => {
        try {  
          const prompt = await this.webvizioClient.getTaskPrompt({ uuid: args.uuid });
          return {
            content: [
              {
                type: 'text' as const,
                text: `Task prompt:\n\n${prompt}`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_task_prompt');
        }
      }
    );

    this.server.registerTool(
      'get_task_console_logs',
      {
        description: 'Fetches the task console logs (Browser console logs) which have been added to the task. Use this tool if the task prompt lacks sufficient information for execution. Do not use this tool if the task and its solution methods are entirely clear from the task prompt ', 
        inputSchema: {
          uuid: z.string().describe('The uuid of the task to get the console logs for')
        },
        annotations: {
          title: 'Get Task Console Logs'
        }
      },
      async (args: { uuid: string }) => {
        try {
          const consoleLogs = await this.webvizioClient.getTaskConsoleLogs({ uuid: args.uuid });
          if (!consoleLogs) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: 'No console logs found'
                }
              ]
            };
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: `Task console logs:\n\n${consoleLogs}`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_task_console_logs');
        }
      }
    );

    this.server.registerTool(
      'get_task_network_logs',
      {
        description: 'Fetches the task network logs (Network requests) which have been added to the task. Use this tool if the task prompt lacks sufficient information for execution. Do not use this tool if the task and its solution methods are entirely clear from the task prompt ', 
        inputSchema: {
          uuid: z.string().describe('The uuid of the task to get the network logs for')
        },
        annotations: {
          title: 'Get Task Network Logs'
        }
      },
      async (args: { uuid: string }) => {
        try {
          const networkLogs = await this.webvizioClient.getTaskNetworkLogs({ uuid: args.uuid });
          if (!networkLogs) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: 'No network logs found'
                }
              ]
            };
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: `Task network logs:\n\n${networkLogs}`  
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_task_network_logs');
        }
      }
    );

    this.server.registerTool(
      'get_task_action_logs',
      {
        description: 'Fetches the task action logs (Repro steps) which have been added to the task. Use this tool if the task prompt lacks sufficient information for execution. Do not use this tool if the task and its solution methods are entirely clear from the task prompt ', 
        inputSchema: {
          uuid: z.string().describe('The uuid of the task to get the action logs for')
        },
        annotations: {
          title: 'Get Task Action Logs'
        }
      },
      async (args: { uuid: string }) => {
        try {
          const actionLogs = await this.webvizioClient.getTaskActionLogs({ uuid: args.uuid });
          if (!actionLogs) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: 'No action logs found'
                }
              ] 
            };
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: `Task action logs:\n\n${actionLogs}`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_task_action_logs'); 
        }
      }
    );


    // Register get_task_screenshot tool
    this.server.registerTool(
      'get_task_screenshot',
      {
        description: 'Fetches the task screenshot. By default, a screenshot is automatically generated when a task is created, displaying the page in the browser exactly as the user saw it at that moment. A distinctive lilac marker on the screenshot indicates the location of the element on the page that the task refers to. In some cases, the task author may also add additional hints and instructions directly onto the screenshot. Use this tool if the task prompt lacks sufficient information for execution. Analyzing a screenshot can also be particularly useful for tasks related to layout or resolving visual bugs. Do not use this tool if the task and its solution methods are entirely clear from the task prompt ', 
        inputSchema: {
          uuid: z.string().describe('The uuid of the task to get the screenshot for')
        },
        annotations: {
          title: 'Get Task Screenshot'
        }
      },
      async (args: { uuid: string }) => {
        try {
          const screenshot = await this.webvizioClient.getTaskScreenshot({ uuid: args.uuid });

          return {
            content: [
              {
                type: 'image' as const,
                data: screenshot,
                mimeType: 'image/png'
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'get_task_screenshot');
        }
      }
    );

    this.server.registerTool(
      'close_task',
      {
        description: 'Closes the task. Use this tool only if the user ask you to close the task. DO NOT use this tool until the user confirms the task is complete.',
        inputSchema: {
          uuid: z.string().describe('The uuid of the task to close')
        },
        annotations: {
          title: 'Close Task'
        }
      },
      async (args: { uuid: string }) => {
        try {
          const result = await this.webvizioClient.closeTask({ uuid: args.uuid });

          return {
            content: [
              {
                type: 'text' as const,
                text: `Task closed successfully`
              }
            ]
          };
        } catch (error) {
          return this.handleError(error, 'close_task');
        }
      }
    );  
  }

  /**
   * Handle errors
   */
  private handleError(error: any, toolName: string) {
    console.error(`[MCP Server] Error handling tool ${toolName}:`, error);
    
    if (this.isMcpError(error)) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error ${error.code}: ${error.message}${error.details ? `\nDetails: ${JSON.stringify(error.details, null, 2)}` : ''}`
          }
        ],
        isError: true
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        }
      ],
      isError: true
    };
  }

  private isMcpError(error: any): error is McpError {
    return error && typeof error === 'object' && 'code' in error && 'message' in error;
  }

  public getServer(): McpServer {
    return this.server;
  }

  public async start(): Promise<void> {
    console.log('[MCP Server] Starting Webvizio MCP Server...');
    // const screenshot = await this.webvizioClient.getTaskScreenshot({ uuid: 'd11b7641-88db-40d5-b3a3-8436a477b9f5' }); 
    // console.log(screenshot);
    // Test API connection on startup
    // try {
    //   await this.webvizioClient.getProjects();
    //   console.log('[MCP Server] ✅ Successfully connected to Webvizio API');
    // } catch (error) {
    //   console.warn('[MCP Server] ⚠️  Failed to connect to Webvizio API on startup:', error);
    //   console.warn('[MCP Server] The server will continue running, but API calls may fail.');
    // }

    console.log('[MCP Server] 🚀 Webvizio MCP Server is ready');
  }

  public async stop(): Promise<void> {
    console.log('[MCP Server] Stopping Webvizio MCP Server...');
    await this.server.close();
    console.log('[MCP Server] ✅ Server stopped');
  }
} 