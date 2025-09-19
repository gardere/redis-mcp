import { HMSetTool } from './hmset_tool.js';
import { HGetTool } from './hget_tool.js';
import { HGetAllTool } from './hgetall_tool.js';
import { ScanTool } from './scan_tool.js';
import { SetTool } from './set_tool.js';
import { GetTool } from './get_tool.js';
import { DelTool } from './del_tool.js';
import { ZAddTool } from './zadd_tool.js';
import { ZRangeTool } from './zrange_tool.js';
import { ZRangeByScoreTool } from './zrangebyscore_tool.js';
import { ZRemTool } from './zrem_tool.js';
import { SAddTool } from './sadd_tool.js';
import { SMembersTool } from './smembers_tool.js';
import { KeysTool } from './keys_tool.js';
export class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.registerDefaultTools();
    }
    registerDefaultTools() {
        const defaultTools = [
            new HMSetTool(),
            new HGetTool(),
            new HGetAllTool(),
            new ScanTool(),
            new KeysTool(),
            new SetTool(),
            new GetTool(),
            new DelTool(),
            new ZAddTool(),
            new ZRangeTool(),
            new ZRangeByScoreTool(),
            new ZRemTool(),
            new SAddTool(),
            new SMembersTool(),
        ];
        for (const tool of defaultTools) {
            this.registerTool(tool);
        }
    }
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    hasToolWithName(name) {
        return this.tools.has(name);
    }
}
