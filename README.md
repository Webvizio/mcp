# Webvizio MCP Server

A TypeScript-based Model Context Protocol (MCP) server that provides secure and structured access to the Webvizio API. This server enables MCP clients to seamlessly interact with Webvizio projects and development tasks through a standardized interface.

Webvizio MCP Server - Automatically converts feedback and bug reports from websites and web apps into actionable, context-enriched developer tasks. Delivered straight to your AI coding tools, the Webvizio MCP Server ensures your AI agent has all the data it needs to solve tasks with speed and accuracy.

## 📋 Available Tools

| Tool | Method | Description |
|------|--------|-------------|
| `get_projects` | GET | Fetch all available Webvizio projects |
| `get_current_project` | GET | Get details of the currently selected project |
| `set_project` | POST | Set the current Webvizio project to work with the project tasks |
| `get_tasks` | GET | Get the list of open tasks assigned to a user |
| `get_task_description` | GET | Get the task description |
| `get_task_prompt` | GET | Get an AI prompt to execute the task |
| `get_task_console_logs` | GET | Get the task console logs |
| `get_task_network_logs` | GET | Get the task network logs |
| `get_task_action_logs` | GET | Get the task action logs (Repro steps) |
| `get_task_screenshot` | GET | Get the task screenshot |
| `close_task` | POST | Set task in Webvizio to Done status |

## 🛠 Installation

1. Make sure you have Node.js 18 (or a higher version) installed on your device.
2. Copy the MCP server configuration code to the `mcpServers` section of your AI Client configuration file.
   ```
   "webvizio": {
      "command": "npx",
      "args": [
         "-y",
         "@webvizio/mcp-server"
      ],
      "env": {
         "WEBVIZIO_API_KEY": "<your-api-key>"
      }
   }
   ```
3. Generate and copy the API key for the MCP server on the AI Settings page https://app.webvizio.com/profile/ai
4. Insert the API key into the `WEBVIZIO_API_KEY` environment variable.
5. Save the changes.
6. Done. Your MCP server is configured and ready to work.   


## 🚀 Usage

1. Open your IDE's chat (e.g., agent mode in Cursor or Cascade in Windsurf).
2. Paste a link to a Webvizio task. Alternatively, you can ask the AI agent to display all your tasks.
3. Instruct the AI agent to execute the selected task.
4. The AI agent can request the use of tools to gather more information on the task (e.g., screenshots, console logs, etc.). Approve these requests to allow the agent to proceed.
5. Check the agent's work to ensure the task has been completed correctly.
6. When the task is complete, ask the AI Agent to close the task.