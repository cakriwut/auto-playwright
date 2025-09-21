#!/usr/bin/env tsx

/**
 * Demo script showing how to use auto-playwright with Amazon Bedrock
 * 
 * To run this demo:
 * 1. Set AWS credentials:
 *    export AWS_REGION=us-east-1
 *    export AWS_ACCESS_KEY_ID=your-access-key
 *    export AWS_SECRET_ACCESS_KEY=your-secret-key
 * 
 * 2. Run the script:
 *    npx tsx demo/provider-demo.ts
 */

import { chromium } from "playwright";
import { auto } from "../src/auto";

async function bedrockDemo() {
  console.log("🚀 Starting Bedrock demo...");
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to a demo page
    await page.goto("https://example.com");
    
    // Configure to use Bedrock
    const bedrockOptions = {
      provider: "bedrock" as const,
      model: "claude-3-5-sonnet",
      awsRegion: process.env.AWS_REGION || "us-east-1",
      debug: true
    };

    console.log("🔍 Querying page content with Bedrock...");
    
    // Query content using Bedrock
    const headerText = await auto(
      "What is the main heading on this page?", 
      { page }, 
      bedrockOptions
    );
    
    console.log("📝 Header text:", headerText);
    
    // Demonstrate assertion with Bedrock
    const hasExample = await auto(
      "Does this page contain the word 'Example'?",
      { page },
      bedrockOptions
    );
    
    console.log("✅ Contains 'Example':", hasExample);
    
    console.log("🎉 Bedrock demo completed successfully!");
    
  } catch (error) {
    console.error("❌ Demo failed:", error);
    if (error instanceof Error && error.message.includes("AWS")) {
      console.log("💡 Make sure AWS credentials are configured:");
      console.log("   export AWS_REGION=us-east-1");
      console.log("   export AWS_ACCESS_KEY_ID=your-access-key");
      console.log("   export AWS_SECRET_ACCESS_KEY=your-secret-key");
    }
  } finally {
    await browser.close();
  }
}

async function openaiDemo() {
  console.log("🚀 Starting OpenAI demo for comparison...");
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to a demo page
    await page.goto("https://example.com");
    
    // Configure to use OpenAI (default)
    const openaiOptions = {
      provider: "openai" as const,
      model: "gpt-4o",
      openaiApiKey: process.env.OPENAI_API_KEY || "dummy-key",
      debug: true
    };

    console.log("🔍 Querying page content with OpenAI...");
    
    // Query content using OpenAI
    const headerText = await auto(
      "What is the main heading on this page?", 
      { page }, 
      openaiOptions
    );
    
    console.log("📝 Header text:", headerText);
    
    console.log("🎉 OpenAI demo completed successfully!");
    
  } catch (error) {
    console.error("❌ Demo failed:", error);
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      console.log("💡 Make sure OpenAI API key is configured:");
      console.log("   export OPENAI_API_KEY=your-api-key");
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log("🔄 Auto-Playwright Provider Demo");
  console.log("==================================");
  
  const provider = process.argv[2] || "bedrock";
  
  if (provider === "bedrock") {
    await bedrockDemo();
  } else if (provider === "openai") {
    await openaiDemo();
  } else {
    console.log("Usage: npx tsx demo/provider-demo.ts [bedrock|openai]");
    console.log("Default: bedrock");
  }
}

if (require.main === module) {
  main().catch(console.error);
}