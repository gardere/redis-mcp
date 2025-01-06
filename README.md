# redis-mcp

A Redis Model Context Protocol (MCP) server that provides Redis database operations through MCP tools.

## Installation

```bash
npm install redis-mcp
```

## Usage

1. Install the package
2. Configure your MCP client (e.g., Claude Desktop) with the following settings:

```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": ["redis-mcp", "--redis-host", "localhost", "--redis-port", "6379"],
      "disabled": false
    }
  }
}
```

Note: The --redis-host and --redis-port arguments are optional. If omitted, the server will use default values of localhost and 6379 respectively.

## Available MCP Tools

|Tool|Type|Description|Input Schema|
|------|------|-------------|--------------|
|hmset|Hash Command|Set multiple hash fields to multiple values|`{ "key": "string", "fields": { [field: string]: string } }`|
|hget|Hash Command|Get the value of a hash field|`{ "key": "string", "field": "string" }`|
|hgetall|Hash Command|Get all the fields and values in a hash|`{ "key": "string" }`|
|hset|Hash Command|Set the value of a hash field|`{ "key": "string", "field": "string", "value": "string" }`|
|scan|String Command|Scan Redis keys matching a pattern|`{ "pattern": "string", "count": "number" (optional) }`|
|set|String Command|Set the string value of a key|`{ "key": "string", "value": "string", "nx": "boolean" (optional), "px": "number" (optional) }`|
|get|String Command|Get the value of a key|`{ "key": "string" }`|
|del|String Command|Delete a key|`{ "key": "string" }`|

## Configuration

The server connects to Redis at `redis://localhost:6379` by default. To customize the connection:

### Command Line Arguments

Optional arguments to customize the Redis connection:

- `--redis-host <host>`: Redis server host (default: localhost)
- `--redis-port <port>`: Redis server port (default: 6379, must be between 1-65535)

Example:
```bash
node src/redis_server.js --redis-host 192.168.1.100 --redis-port 6380
```

## License

MIT: https://opensource.org/license/mit