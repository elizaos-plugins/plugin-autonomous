#!/usr/bin/env node

/**
 * Example runner for testing autonomous agent scenarios
 * 
 * Usage: npm run scenarios:example
 */

import { scenariosPlugin } from "./index";

async function runExample() {
  console.log("=== Autonomous Agent Scenarios ===\n");
  
  console.log("Available Scenarios:");
  console.log("-------------------");
  
  // List all actions
  const actions = scenariosPlugin.actions || [];
  actions.forEach((action, index) => {
    console.log(`${index + 1}. ${action.name}`);
    console.log(`   ${action.description}`);
    if (action.examples && action.examples[0]) {
      const example = action.examples[0][0];
      if (example.content?.text) {
        console.log(`   Example: "${example.content.text}"`);
      }
    }
    console.log();
  });
  
  console.log("\nProviders:");
  console.log("----------");
  
  // List all providers
  const providers = scenariosPlugin.providers || [];
  providers.forEach((provider) => {
    console.log(`- ${provider.name}: ${provider.description}`);
  });
  
  console.log("\n=== Example Commands ===\n");
  
  console.log("1. Research Task:");
  console.log('   "Research documentation on ElizaOS plugin development"');
  console.log();
  
  console.log("2. GitHub Analysis:");
  console.log('   "Analyze trending GitHub repositories in TypeScript"');
  console.log('   "Analyze repository https://github.com/microsoft/TypeScript"');
  console.log();
  
  console.log("3. System Health:");
  console.log('   "Check system health status"');
  console.log();
  
  console.log("4. Learning Path:");
  console.log('   "Learn React programming tutorial"');
  console.log();
  
  console.log("=== Integration Example ===\n");
  console.log(`import { autoPlugin } from "@elizaos/plugin-auto";
import { scenariosPlugin } from "@elizaos/plugin-auto/scenarios";
import { shellPlugin } from "@elizaos/plugin-shell";
import { browserbasePlugin } from "@elizaos/plugin-browserbase";
import { todoPlugin } from "@elizaos/plugin-todo";

const agent = new Agent({
  plugins: [
    autoPlugin,
    scenariosPlugin,
    shellPlugin,
    browserbasePlugin,
    todoPlugin
  ],
});

// The agent will now autonomously handle the scenarios!`);
  
  console.log("\n=== Notes ===\n");
  console.log("- The autonomous agent will create TODO tasks for each scenario");
  console.log("- Progress is tracked through the TODO system");
  console.log("- Multiple scenarios can run concurrently");
  console.log("- Results are saved to the file system (reports, notes, etc.)");
}

// Run the example
runExample().catch(console.error); 