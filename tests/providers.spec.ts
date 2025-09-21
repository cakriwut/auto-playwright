import { test, expect } from "@playwright/test";
import { createLLMProvider } from "../src/providerFactory";
import { OpenAIProvider } from "../src/openaiProvider";
import { BedrockProvider } from "../src/bedrockProvider";

test("provider factory creates OpenAI provider by default", () => {
  const provider = createLLMProvider({ openaiApiKey: "dummy-key" });
  expect(provider).toBeInstanceOf(OpenAIProvider);
});

test("provider factory creates OpenAI provider when specified", () => {
  const provider = createLLMProvider({ 
    provider: "openai",
    openaiApiKey: "dummy-key"
  });
  expect(provider).toBeInstanceOf(OpenAIProvider);
});

test("provider factory creates Bedrock provider when specified", () => {
  const provider = createLLMProvider({ provider: "bedrock" });
  expect(provider).toBeInstanceOf(BedrockProvider);
});

test("provider factory throws error for unsupported provider", () => {
  expect(() =>
    createLLMProvider({ provider: "unsupported" as any }),
  ).toThrow("Unsupported provider: unsupported");
});

test("provider factory passes through options to OpenAI provider", () => {
  const options = {
    provider: "openai" as const,
    openaiApiKey: "test-key",
    openaiBaseUrl: "https://test.openai.com",
  };
  
  // This should not throw
  const provider = createLLMProvider(options);
  expect(provider).toBeInstanceOf(OpenAIProvider);
});

test("provider factory passes through options to Bedrock provider", () => {
  const options = {
    provider: "bedrock" as const,
    awsRegion: "us-west-2",
    awsAccessKeyId: "test-key",
    awsSecretAccessKey: "test-secret",
  };
  
  // This should not throw
  const provider = createLLMProvider(options);
  expect(provider).toBeInstanceOf(BedrockProvider);
});