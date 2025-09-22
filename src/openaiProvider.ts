import OpenAI from "openai";
import { LLMProvider, LLMMessage, LLMResponse } from "./providers";
import { StepOptions } from "./types";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(options?: StepOptions) {
    this.client = new OpenAI({
      apiKey: options?.openaiApiKey || process.env.OPENAI_API_KEY,
      baseURL: options?.openaiBaseUrl,
      defaultQuery: options?.openaiDefaultQuery,
      defaultHeaders: options?.openaiDefaultHeaders,
    });
  }

  async runTools(params: {
    model: string;
    messages: LLMMessage[];
    tools: any;
    onMessage?: (message: LLMResponse) => void;
  }): Promise<string | null> {
    const runner = this.client.beta.chat.completions
      .runTools({
        model: params.model,
        messages: params.messages,
        tools: params.tools,
      })
      .on("message", (message) => {
        if (params.onMessage) {
          params.onMessage(message as LLMResponse);
        }
      });

    return await runner.finalContent();
  }
}
