//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const ZRangeByScoreToolEval: EvalFunction = {
    name: 'ZRangeByScoreTool Evaluation',
    description: 'Evaluates retrieving members from a sorted set by score range',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Retrieve all members from the sorted set 'mySortedSet' with scores between 10 and 30, including their scores");
        return JSON.parse(result);
    }
};

const zaddEval: EvalFunction = {
    name: 'ZAddTool',
    description: 'Evaluates the functionality of adding members to a sorted set',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Add the members {score: 1, value: 'Alice'} and {score: 2, value: 'Bob'} to the sorted set 'leaderboard'.");
        return JSON.parse(result);
    }
};

const zremEval: EvalFunction = {
    name: 'zremEval',
    description: 'Evaluates removing members from a sorted set using ZRemTool',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Remove the members 'alex' and 'sara' from the sorted set 'myzset'.");
        return JSON.parse(result);
    }
};

const hmsetEval: EvalFunction = {
    name: 'hmset Tool Evaluation',
    description: 'Evaluates the functionality of setting multiple fields in a Redis hash using hmset',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Use the hmset tool to set the fields 'name'='John Doe' and 'email'='john@example.com' on a Redis hash key 'user:42'.");
        return JSON.parse(result);
    }
};

const hgetallEval: EvalFunction = {
    name: 'HGetAllTool Evaluation',
    description: 'Evaluates the functionality of the hgetall tool',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Retrieve all fields and values from the Redis hash with key 'myHash' using the hgetall tool.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [ZRangeByScoreToolEval, zaddEval, zremEval, hmsetEval, hgetallEval]
};
  
export default config;
  
export const evals = [ZRangeByScoreToolEval, zaddEval, zremEval, hmsetEval, hgetallEval];