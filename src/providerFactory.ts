import { LLMProvider } from "./providers";
import { OpenAIProvider } from "./openaiProvider";
import { BedrockProvider } from "./bedrockProvider";
import { StepOptions } from "./types";

export function createLLMProvider(options?: StepOptions): LLMProvider {
  const provider = options?.provider || "openai";

  switch (provider) {
    case "openai":
      return new OpenAIProvider(options);
    case "bedrock":
      return new BedrockProvider(options);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
