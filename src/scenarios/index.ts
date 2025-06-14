import { type Plugin } from "@elizaos/core";

// Import all scenario components
import {
  documentationResearchProvider,
  startDocumentationResearchAction,
  checkResearchProgressAction,
} from "./documentationResearch";

import {
  githubAnalysisProvider,
  startGithubAnalysisAction,
  analyzeSpecificRepoAction,
} from "./githubAnalysis";

import { systemHealthProvider, systemHealthCheckAction } from "./systemHealth";
import { learningPathProvider, startLearningPathAction } from "./learningPath";

// Import e2e tests
import { scenarioTests } from "./tests";

/**
 * Autonomous Agent Scenarios Plugin
 * 
 * This plugin provides realistic scenarios for the autonomous agent to execute
 * using shell, browserbase, and todo plugins.
 */
export const scenariosPlugin: Plugin = {
  name: "autonomous-scenarios",
  description: "Provides realistic task scenarios for autonomous agents",
  
  providers: [
    documentationResearchProvider,
    githubAnalysisProvider,
    systemHealthProvider,
    learningPathProvider,
  ],
  
  actions: [
    // Documentation Research
    startDocumentationResearchAction,
    checkResearchProgressAction,
    
    // GitHub Analysis
    startGithubAnalysisAction,
    analyzeSpecificRepoAction,
    
    // System Health
    systemHealthCheckAction,
    
    // Learning Path
    startLearningPathAction,
  ],
  
  // E2E tests for the scenarios
  tests: scenarioTests,
  
  init: async (config, runtime) => {
    // The autonomous agent can be initialized with specific goals
    // by creating initial tasks with the appropriate tags
    
    // Example: Check if there are any pending autonomous tasks on startup
    const autonomousTasks = await runtime.getTasks({
      tags: ["autonomous", "TODO"],
    });
    
    if (autonomousTasks.length === 0) {
      // Create a default welcome task for the autonomous agent
      await runtime.createTask({
        name: "Initialize autonomous agent capabilities",
        description: "Review available capabilities and wait for tasks",
        tags: ["TODO", "autonomous", "initialization"],
        metadata: {
          capabilities: [
            "Documentation research and report generation",
            "GitHub repository analysis",
            "System health monitoring",
            "Learning path execution",
          ],
          createdAt: new Date().toISOString(),
        },
      });
    }
  },
};

// Export individual components for testing
export {
  documentationResearchProvider,
  startDocumentationResearchAction,
  checkResearchProgressAction,
  githubAnalysisProvider,
  startGithubAnalysisAction,
  analyzeSpecificRepoAction,
  systemHealthProvider,
  systemHealthCheckAction,
  learningPathProvider,
  startLearningPathAction,
}; 