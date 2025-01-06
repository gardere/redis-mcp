import { BaseTool } from '../interfaces/types.js';
import { HMSetTool } from './hmset_tool.js';
import { HGetTool } from './hget_tool.js';
import { HGetAllTool } from './hgetall_tool.js';
import { ScanTool } from './scan_tool.js';

export class ToolRegistry {
  private tools: Map<string, BaseTool>;

  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    const defaultTools = [
      new HMSetTool(),
      new HGetTool(),
      new HGetAllTool(),
      new ScanTool(),
    ];

    for (const tool of defaultTools) {
      this.registerTool(tool);
    }
  }

  registerTool(tool: BaseTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  hasToolWithName(name: string): boolean {
    return this.tools.has(name);
  }
}