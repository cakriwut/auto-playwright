import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { LLMProvider, LLMMessage, LLMResponse } from "./providers";
import { StepOptions } from "./types";
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";

export class BedrockProvider implements LLMProvider {
  private client: BedrockRuntimeClient;

  constructor(options?: StepOptions) {
    const config: any = {
      region: options?.awsRegion || process.env.AWS_REGION || "us-east-1",
    };

    // Add AWS credentials if provided
    if (options?.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID) {
      config.credentials = {
        accessKeyId: options?.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey:
          options?.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: options?.awsSessionToken || process.env.AWS_SESSION_TOKEN,
      };
    }

    this.client = new BedrockRuntimeClient(config);
  }

  async runTools(params: {
    model: string;
    messages: LLMMessage[];
    tools: any;
    onMessage?: (message: LLMResponse) => void;
  }): Promise<string | null> {
    // Convert OpenAI tools to Claude 3 format
    const toolsFormatted = params.tools.map(
      (tool: RunnableFunctionWithParse<any>) => ({
        name: tool.name!,
        description: tool.description || "",
        input_schema: tool.parameters || {},
      }),
    );

    // Build the prompt for Claude 3
    const systemMessage = params.messages.find((m) => m.role === "system");
    const userMessages = params.messages.filter((m) => m.role !== "system");

    let conversationMessages: any[] = [
      {
        role: "user",
        content: userMessages.map((m) => m.content).join("\n\n"),
      },
    ];

    let finalResponse: string | null = null;
    let maxIterations = 10; // Prevent infinite loops
    let iteration = 0;

    while (iteration < maxIterations) {
      const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        system: systemMessage?.content || "",
        messages: conversationMessages,
        tools: toolsFormatted,
      };

      const command = new InvokeModelCommand({
        modelId: this.normalizeModelId(params.model),
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody),
      });

      try {
        const response = await this.client.send(command);
        const responseBody = JSON.parse(
          new TextDecoder().decode(response.body),
        );

        if (responseBody.content) {
          let assistantMessage: any = {
            role: "assistant",
            content: [],
          };

          for (const content of responseBody.content) {
            if (content.type === "text") {
              finalResponse = content.text;
              assistantMessage.content.push({
                type: "text",
                text: content.text,
              });
            } else if (content.type === "tool_use") {
              assistantMessage.content.push(content);

              // Notify about the tool call
              if (params.onMessage) {
                params.onMessage({
                  role: "assistant",
                  content: finalResponse || undefined,
                  tool_calls: [
                    {
                      function: {
                        name: content.name,
                        arguments: JSON.stringify(content.input),
                      },
                    },
                  ],
                });
              }

              // Find and execute the tool
              const tool = params.tools.find(
                (t: RunnableFunctionWithParse<any>) => t.name === content.name,
              );
              if (tool && tool.function) {
                try {
                  const result = await tool.function(content.input);

                  // Add assistant message to conversation
                  conversationMessages.push(assistantMessage);

                  // Add tool result to conversation
                  conversationMessages.push({
                    role: "user",
                    content: [
                      {
                        type: "tool_result",
                        tool_use_id: content.id,
                        content: JSON.stringify(result),
                      },
                    ],
                  } as any);

                  // If this is a result function, we're done
                  if (content.name.startsWith("result")) {
                    return finalResponse;
                  }
                } catch (error) {
                  console.error(`Error executing tool ${content.name}:`, error);
                  // Add error result
                  conversationMessages.push({
                    role: "user",
                    content: [
                      {
                        type: "tool_result",
                        tool_use_id: content.id,
                        content: `Error: ${error}`,
                        is_error: true,
                      },
                    ],
                  } as any);
                }
              }
            }
          }

          // If no tool calls, add the assistant message and break
          if (!responseBody.content?.some((c: any) => c.type === "tool_use")) {
            break;
          }
        }

        iteration++;
      } catch (error) {
        console.error("Bedrock API error:", error);
        throw error;
      }
    }

    return finalResponse;
  }

  private normalizeModelId(model: string): string {
    // Map common model names to Bedrock model IDs
    const modelMap: { [key: string]: string } = {
      "claude-3-sonnet": "anthropic.claude-3-sonnet-20240229-v1:0",
      "claude-3-haiku": "anthropic.claude-3-haiku-20240307-v1:0",
      "claude-3-opus": "anthropic.claude-3-opus-20240229-v1:0",
      "claude-3-5-sonnet": "anthropic.claude-3-5-sonnet-20241022-v2:0",
    };

    return modelMap[model] || model;
  }
}
