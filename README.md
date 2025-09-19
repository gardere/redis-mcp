# Redis MCP Server

A Model Context Protocol (MCP) server that provides access to Redis database operations.

> **Fork Notice:** This is a fork of the original [redis-mcp](https://github.com/farhankaz/redis-mcp) with additional features including the `keys` command and enhanced `scan` functionality.

## Project Structure

```
src/
├── interfaces/
│   └── types.ts           # Shared TypeScript interfaces and types
├── tools/
│   ├── base_tool.ts       # Abstract base class for Redis tools
│   ├── tool_registry.ts   # Registry managing all available Redis tools
│   ├── hmset_tool.ts      # HMSET Redis operation
│   ├── hget_tool.ts       # HGET Redis operation
│   ├── hgetall_tool.ts    # HGETALL Redis operation
│   ├── scan_tool.ts       # SCAN Redis operation
│   ├── keys_tool.ts       # KEYS Redis operation
│   ├── set_tool.ts        # SET Redis operation
│   ├── get_tool.ts        # GET Redis operation
│   ├── del_tool.ts        # DEL Redis operation
│   ├── zadd_tool.ts       # ZADD Redis operation
│   ├── zrange_tool.ts     # ZRANGE Redis operation
│   ├── zrangebyscore_tool.ts # ZRANGEBYSCORE Redis operation
│   └── zrem_tool.ts       # ZREM Redis operation
└── redis_server.ts        # Main server implementation
```

## Available Tools

| Tool | Type | Description | Input Schema |
|------|------|-------------|--------------|
| hmset | Hash Command | Set multiple hash fields to multiple values | `key`: string (Hash key)<br>`fields`: object (Field-value pairs to set) |
| hget | Hash Command | Get the value of a hash field | `key`: string (Hash key)<br>`field`: string (Field to get) |
| hgetall | Hash Command | Get all fields and values in a hash | `key`: string (Hash key) |
| scan | Key Command | Scan Redis keys matching a pattern | `pattern`: string (Pattern to match, e.g., "user:*")<br>`count`: number, optional (Number of keys to return)<br>`unlimited`: boolean, optional (If true, return all matching keys without 10-key limit) |
| keys | Key Command | Get all Redis keys matching a pattern | `pattern`: string (Pattern to match, e.g., "user:*" or "*" for all keys) |
| set | String Command | Set string value with optional NX and PX options | `key`: string (Key to set)<br>`value`: string (Value to set)<br>`nx`: boolean, optional (Only set if not exists)<br>`px`: number, optional (Expiry in milliseconds) |
| get | String Command | Get string value | `key`: string (Key to get) |
| del | Key Command | Delete a key | `key`: string (Key to delete) |
| zadd | Sorted Set Command | Add one or more members to a sorted set | `key`: string (Sorted set key)<br>`members`: array of objects with `score`: number and `value`: string |
| zrange | Sorted Set Command | Return a range of members from a sorted set by index | `key`: string (Sorted set key)<br>`start`: number (Start index)<br>`stop`: number (Stop index)<br>`withScores`: boolean, optional (Include scores in output) |
| zrangebyscore | Sorted Set Command | Return members from a sorted set with scores between min and max | `key`: string (Sorted set key)<br>`min`: number (Minimum score)<br>`max`: number (Maximum score)<br>`withScores`: boolean, optional (Include scores in output) |
| zrem | Sorted Set Command | Remove one or more members from a sorted set | `key`: string (Sorted set key)<br>`members`: array of strings (Members to remove) |
| sadd | Set Command | Add one or more members to a set | `key`: string (Set key)<br>`members`: array of strings (Members to add to the set) |
| smembers | Set Command | Get all members in a set | `key`: string (Set key) |

## Usage

Configure in your MCP client (e.g., Claude Desktop, Cursor, Cline):

```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": ["@https://github.com/gardere/redis-mcp", "--redis-host", "localhost", "--redis-port", "6379"],
      "disabled": false
    }
  }
}
```

> **Note:** This is a fork that's not published on npm, so you need to install directly from GitHub using the `@https://github.com/gardere/redis-mcp` syntax.

## Command Line Arguments

- `--redis-host`: Redis server host (default: localhost)
- `--redis-port`: Redis server port (default: 6379)

## Development

To add a new Redis tool:

1. Create a new tool class in `src/tools/` extending `RedisTool`
2. Define the tool's interface in `src/interfaces/types.ts`
3. Register the tool in `src/tools/tool_registry.ts`

Example tool implementation:

```typescript
export class MyTool extends RedisTool {
  name = 'mytool';
  description = 'Description of what the tool does';
  inputSchema = {
    type: 'object',
    properties: {
      // Define input parameters
    },
    required: ['requiredParam']
  };

  validateArgs(args: unknown): args is MyToolArgs {
    // Implement argument validation
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    // Implement tool logic
  }
}
```



## Running evals

The evals package loads an mcp client that then runs the index.ts file, so there is no need to rebuild between tests. You can load environment variables by prefixing the npx command. Full documentation can be found [here](https://www.mcpevals.io/docs).

```bash
OPENAI_API_KEY=your-key  npx mcp-eval src/evals/evals.ts src/tools/zrangebyscore_tool.ts
```

## What's New in This Fork

This fork adds the following enhancements over the original redis-mcp:

- **🆕 KEYS Command**: New `keys` tool that retrieves all Redis keys matching a pattern (similar to Redis KEYS command)
- **🔧 Enhanced SCAN Command**: Added `unlimited` parameter to optionally disable the 10-key limit and return all matching keys
- **✅ Comprehensive Tests**: Full test coverage for both new features

## License

MIT: https://opensource.org/license/mit
