# Provider Demo

This directory contains demonstration scripts showing how to use auto-playwright with different LLM providers.

## provider-demo.ts

A complete demo showing both OpenAI and Amazon Bedrock providers in action.

### Prerequisites

1. **For Bedrock:**
   ```bash
   export AWS_REGION=us-east-1
   export AWS_ACCESS_KEY_ID=your-access-key
   export AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

2. **For OpenAI:**
   ```bash
   export OPENAI_API_KEY=your-api-key
   ```

### Usage

```bash
# Run Bedrock demo (default)
npx tsx demo/provider-demo.ts bedrock

# Run OpenAI demo
npx tsx demo/provider-demo.ts openai
```

### Features Demonstrated

- Provider switching between OpenAI and Bedrock
- Querying page content with natural language
- Assertion checking 
- Debug output showing LLM interactions
- Error handling and helpful setup messages

This demo shows how the same auto-playwright API works seamlessly with different LLM providers, requiring only configuration changes.