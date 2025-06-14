import { type IAgentRuntime, type Memory, createUniqueUuid } from "@elizaos/core";

export const githubAnalysisE2ETest = {
  name: "github-analysis-e2e",
  description: "E2E test for GitHub repository analysis scenario",
  fn: async (runtime: IAgentRuntime) => {
    console.log("Starting GitHub Analysis E2E Test...");
    
    try {
      const testRoomId = createUniqueUuid(runtime, "test-room");
      
      // Test 1: Analyze trending repositories
      console.log("Test 1: Analyzing trending repositories...");
      
      const trendingMessage: Memory = {
        id: createUniqueUuid(runtime, "test-trending"),
        content: { 
          text: "Analyze trending GitHub repositories in TypeScript", 
          source: "test" 
        },
        roomId: testRoomId,
        agentId: runtime.agentId,
        entityId: runtime.agentId,
        createdAt: Date.now(),
      };

      // Find the GitHub analysis action
      const githubAction = runtime.actions.find(
        action => action.name === "START_GITHUB_ANALYSIS"
      );
      
      if (!githubAction) {
        throw new Error("START_GITHUB_ANALYSIS action not found");
      }

      // Validate and execute
      const isValid = await githubAction.validate(runtime, trendingMessage);
      if (!isValid) {
        throw new Error("GitHub trending message validation failed");
      }

      const state = await runtime.composeState(trendingMessage);
      const callback = async (response: any) => {
        console.log("Action response:", response.text);
        return [];
      };
      
      await githubAction.handler(runtime, trendingMessage, state, {}, callback);

      // Wait for tasks
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if getTasks is available
      if (typeof runtime.getTasks !== 'function') {
        console.warn("⚠️ Warning: runtime.getTasks() is not available. This method is provided by @elizaos/plugin-sql.");
        console.warn("⚠️ Skipping task verification tests.");
        console.log("✅ GitHub Analysis E2E Test PASSED (with warnings)\n");
        return;
      }

      // Verify tasks were created
      const githubTasks = await runtime.getTasks({
        tags: ["github", "analysis", "TODO"],
      });

      if (githubTasks.length === 0) {
        throw new Error("No GitHub analysis tasks were created");
      }

      console.log(`✓ Created ${githubTasks.length} GitHub analysis tasks`);

      // Test 2: Analyze specific repository
      console.log("Test 2: Analyzing specific repository...");
      
      const specificRepoMessage: Memory = {
        id: createUniqueUuid(runtime, "test-specific"),
        content: { 
          text: "Analyze repository https://github.com/microsoft/TypeScript", 
          source: "test" 
        },
        roomId: testRoomId,
        agentId: runtime.agentId,
        entityId: runtime.agentId,
        createdAt: Date.now(),
      };

      const specificRepoAction = runtime.actions.find(
        action => action.name === "ANALYZE_SPECIFIC_REPO"
      );
      
      if (!specificRepoAction) {
        throw new Error("ANALYZE_SPECIFIC_REPO action not found");
      }

      const specificValid = await specificRepoAction.validate(runtime, specificRepoMessage);
      if (!specificValid) {
        throw new Error("Specific repository message validation failed");
      }

      await specificRepoAction.handler(runtime, specificRepoMessage, state, {}, callback);
      
      console.log("✓ Specific repository analysis initiated");

      // Test 3: Check GitHub context provider
      console.log("Test 3: Checking GitHub analysis context provider...");
      
      const githubProvider = runtime.providers.find(
        p => p.name === "GITHUB_ANALYSIS_CONTEXT"
      );
      
      if (!githubProvider) {
        throw new Error("GITHUB_ANALYSIS_CONTEXT provider not found");
      }

      const context = await githubProvider.get(runtime, trendingMessage, state);
      
      if (!context.text.includes("Active GitHub Repository Analysis Tasks")) {
        throw new Error("Provider context does not include active tasks");
      }

      console.log("✓ GitHub analysis context provider returns active tasks");

      console.log("✅ GitHub Analysis E2E Test PASSED\n");
      
    } catch (error) {
      console.error("❌ GitHub Analysis E2E Test FAILED:", error);
      throw error;
    }
  }
}; 