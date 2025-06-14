import { type IAgentRuntime, type Memory, createUniqueUuid } from "@elizaos/core";

export const documentationResearchE2ETest = {
  name: "documentation-research-e2e",
  description: "E2E test for documentation research scenario",
  fn: async (runtime: IAgentRuntime) => {
    console.log("Starting Documentation Research E2E Test...");
    
    try {
      // Test 1: Start documentation research
      console.log("Test 1: Starting documentation research...");
      
      const testRoomId = createUniqueUuid(runtime, "test-room");
      const message: Memory = {
        id: createUniqueUuid(runtime, "test-message"),
        content: { 
          text: "Research documentation on ElizaOS plugin development", 
          source: "test" 
        },
        roomId: testRoomId,
        agentId: runtime.agentId,
        entityId: runtime.agentId,
        createdAt: Date.now(),
      };

      // Find the research action
      const researchAction = runtime.actions.find(
        action => action.name === "START_DOCUMENTATION_RESEARCH"
      );
      
      if (!researchAction) {
        throw new Error("START_DOCUMENTATION_RESEARCH action not found");
      }

      // Validate the action
      const isValid = await researchAction.validate(runtime, message);
      if (!isValid) {
        throw new Error("Research message validation failed");
      }

      // Execute the action
      const state = await runtime.composeState(message);
      const callback = async (response: any) => {
        console.log("Action response:", response.text);
        return [];
      };
      
      await researchAction.handler(runtime, message, state, {}, callback);

      // Wait a bit for tasks to be created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if getTasks is available
      if (typeof runtime.getTasks !== 'function') {
        console.warn("⚠️ Warning: runtime.getTasks() is not available. This method is provided by @elizaos/plugin-sql.");
        console.warn("⚠️ Skipping task verification tests.");
        console.log("✅ Documentation Research E2E Test PASSED (with warnings)\n");
        return;
      }

      // Verify research tasks were created
      const researchTasks = await runtime.getTasks({
        tags: ["research", "documentation", "TODO"],
      });

      if (researchTasks.length === 0) {
        throw new Error("No research tasks were created");
      }

      console.log(`✓ Created ${researchTasks.length} research tasks`);

      // Test 2: Check research context provider
      console.log("Test 2: Checking research context provider...");
      
      const researchProvider = runtime.providers.find(
        p => p.name === "DOCUMENTATION_RESEARCH_CONTEXT"
      );
      
      if (!researchProvider) {
        throw new Error("DOCUMENTATION_RESEARCH_CONTEXT provider not found");
      }

      const context = await researchProvider.get(runtime, message, state);
      
      if (!context.text.includes("Active Documentation Research Tasks")) {
        throw new Error("Provider context does not include active tasks");
      }

      console.log("✓ Research context provider returns active tasks");

      // Test 3: Check progress action
      console.log("Test 3: Checking research progress action...");
      
      const progressMessage: Memory = {
        id: createUniqueUuid(runtime, "test-progress"),
        content: { 
          text: "What's the research progress?", 
          source: "test" 
        },
        roomId: testRoomId,
        agentId: runtime.agentId,
        entityId: runtime.agentId,
        createdAt: Date.now(),
      };

      const progressAction = runtime.actions.find(
        action => action.name === "CHECK_RESEARCH_PROGRESS"
      );
      
      if (!progressAction) {
        throw new Error("CHECK_RESEARCH_PROGRESS action not found");
      }

      const progressValid = await progressAction.validate(runtime, progressMessage);
      if (!progressValid) {
        throw new Error("Progress check validation failed");
      }

      await progressAction.handler(runtime, progressMessage, state, {}, callback);
      
      console.log("✓ Research progress check completed");

      // Cleanup: Tasks will be cleaned up by the test framework
      console.log("Test cleanup: Tasks created during test will remain for inspection");

      console.log("✅ Documentation Research E2E Test PASSED\n");
      
    } catch (error) {
      console.error("❌ Documentation Research E2E Test FAILED:", error);
      throw error;
    }
  }
}; 