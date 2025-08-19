# OpenAI MCP Server

A Model Context Protocol (MCP) server with OpenAI integration, providing tools and resources for AI applications.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd mcp-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running the Server

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Project Structure

```
mcp-server/
├── src/
│   └── index.js      # Main server file
├── .env             # Environment variables
├── package.json     # Project dependencies
└── README.md        # Project documentation
```

## Available Tools

- `get_weather`: Get the current weather in a specified location

## Available Resources

- `weather_data`: Current weather data for various locations

## API Endpoints

- `POST /execute-tool`: Execute a specific tool with the provided parameters

## License

MIT
