
export type AgentActionRequest = {
  gameId: number;
  instruction: string;
};

export type AgentToolName =
  | "list_files"
  | "read_file"
  | "create_file"
  | "edit_file"
  | "delete_file";

export type AgentToolCall = {
  id: string;
  name: AgentToolName;
  arguments: Record<string, unknown>;
};

export type AgentToolResult = {
  toolCallId: string;
  success: boolean;
  result?: unknown;
  error?: string;
};

export type AgentExecutionLog = {
  timestamp: string;
  toolName: AgentToolName;
  arguments: Record<string, unknown>;
  success: boolean;
  error?: string;
};

export type AgentActionResponse = {
  success: boolean;
  message: string;
  gameId: number;
  logs: AgentExecutionLog[];
};
