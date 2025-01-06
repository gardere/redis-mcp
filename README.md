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
      "args": ["redis-mcp"],
      "disabled": false
    }
  }
}
```

3. Start your MCP client

## Available MCP Tools

### hmset
Set multiple hash fields to multiple values

**Input Schema:**
```json
{
  "key": "string",
  "fields": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

**Example:**
```json
{
  "key": "user:123",
  "fields": {
    "name": "John",
    "email": "john@example.com"
  }
}
```

### hget
Get the value of a hash field

**Input Schema:**
```json
{
  "key": "string",
  "field": "string"
}
```

**Example:**
```json
{
  "key": "user:123",
  "field": "name"
}
```

### hgetall
Get all the fields and values in a hash

**Input Schema:**
```json
{
  "key": "string"
}
```

**Example:**
```json
{
  "key": "user:123"
}
```

### hset
Set the value of a hash field

**Input Schema:**
```json
{
  "key": "string",
  "field": "string",
  "value": "string"
}
```

**Example:**
```json
{
  "key": "user:123",
  "field": "age",
  "value": "30"
}
```

### scan
Scan Redis keys matching a pattern

**Input Schema:**
```json
{
  "pattern": "string",
  "count": "number" // optional
}
```

**Example:**
```json
{
  "pattern": "user:*",
  "count": 100
}
```

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