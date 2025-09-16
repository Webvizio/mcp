#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WebvizioMcpServer } from './server.js';
import { getConfig } from './config.js';

async function main() {
  console.log('🔧 Initializing Webvizio MCP Server...');
  
  try {
    // Load configuration
    const config = getConfig();
    console.log(`🔑 API Key configured: ${config.apiKey ? '✅' : '❌'}`);

    // Create server instance
    const webvizioServer = new WebvizioMcpServer(config);
    
    // Start the server
    await webvizioServer.start();

    // Set up transport (stdio for MCP)
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await webvizioServer.getServer().connect(transport);
    
    console.log('🎉 Webvizio MCP Server started successfully!');
    console.log('💡 The server is now ready to receive MCP requests via stdio.');

    // Handle graceful shutdown
    const handleShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      try {
        await webvizioServer.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    
  } catch (error) {
    console.error('❌ Failed to start Webvizio MCP Server:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('WEBVIZIO_API_KEY')) {
        console.error('');
        console.error('🔧 Configuration Help:');
        console.error('  You can provide the API key in two ways:');
        console.error('  1. As a command line argument:');
        console.error('     npx webvizio-mcp WEBVIZIO_API_KEY=your_key_here');
        console.error('  2. As an environment variable:');
        console.error('     - Copy .env.example to .env');
        console.error('     - Set your WEBVIZIO_API_KEY in the .env file');
        console.error('');
        console.error('');
        console.error('Example command line usage:');
        console.error('  npx webvizio-mcp WEBVIZIO_API_KEY=your_actual_api_key_here');
      }
    }
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('🚨 Fatal error:', error);
  process.exit(1);
}); 