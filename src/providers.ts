export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  role: "assistant";
  content?: string;
  tool_calls?: {
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface LLMProvider {
  runTools(params: {
    model: string;
    messages: LLMMessage[];
    tools: any; // Keep this flexible to accommodate different tool formats
    onMessage?: (message: LLMResponse) => void;
  }): Promise<string | null>;
}
