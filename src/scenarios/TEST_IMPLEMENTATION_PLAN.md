# E2E Test Implementation Plan for Autonomous Agent Scenarios

## Current Issue
- Created unit tests with vitest and mocks
- Need real e2e tests that use actual ElizaOS runtime
- Tests should be loaded into plugin's `tests[]` array
- Run with `elizaos test` command, not vitest

## Correct E2E Test Structure

### 1. Test File Pattern
Each scenario needs a test file that:
- Exports a test object with `name`, `description`, and `run` function
- Uses real runtime, no mocks
- Actually triggers the scenario actions
- Verifies real outcomes (tasks created, files generated, etc.)

### 2. Test Integration
- Add tests to the plugin's `tests` array
- Tests run in real environment with all plugins loaded
- Can verify actual side effects (TODOs created, files written, etc.)

## Implementation Tasks

### Phase 1: Create E2E Test Files
1. **Documentation Research E2E Test** (`tests/documentationResearch.e2e.ts`)
   - Trigger research action with real message
   - Verify TODO tasks are created
   - Check that research context provider returns data

2. **GitHub Analysis E2E Test** (`tests/githubAnalysis.e2e.ts`)
   - Test trending repository analysis
   - Test specific repository analysis
   - Verify task creation and metadata

3. **System Health E2E Test** (`tests/systemHealth.e2e.ts`)
   - Trigger health check action
   - Verify monitoring tasks created
   - Check sub-tasks with proper commands

4. **Learning Path E2E Test** (`tests/learningPath.e2e.ts`)
   - Start learning path for different topics
   - Verify milestone creation
   - Check tutorial URL selection

### Phase 2: Integration Test
5. **Scenarios Integration Test** (`tests/scenariosIntegration.e2e.ts`)
   - Test multiple scenarios running together
   - Verify provider context aggregation
   - Test autonomous agent flow

### Phase 3: Update Plugin
6. **Update index.ts**
   - Import all e2e tests
   - Add to plugin's `tests` array
   - Ensure proper test loading

### Phase 4: Fix and Verify
7. **Run Tests**
   - Execute `elizaos test`
   - Fix any failing tests
   - Ensure all scenarios work correctly

## Test Structure Example

```typescript
export const documentationResearchE2ETest = {
  name: "documentation-research-e2e",
  description: "E2E test for documentation research scenario",
  run: async (runtime: IAgentRuntime) => {
    // Create test message
    const message = {
      id: generateId(),
      content: { text: "Research documentation on ElizaOS plugins", source: "test" },
      roomId: testRoomId,
      agentId: runtime.agentId,
      createdAt: Date.now(),
    };
    
    // Process through runtime
    await runtime.processMessage(message);
    
    // Verify outcomes
    const tasks = await runtime.getTasks({ tags: ["research", "documentation"] });
    
    // Assert real results
    if (tasks.length === 0) throw new Error("No research tasks created");
    
    console.log("✓ Documentation research scenario created tasks successfully");
  }
};
```

## Success Criteria
- All tests run with `elizaos test`
- No vitest imports or mocks
- Tests use real runtime and verify real outcomes
- All scenarios have comprehensive e2e coverage
- Tests pass consistently

## Execution Order
1. Remove current mock-based tests
2. Create proper e2e test files
3. Add tests to plugin
4. Run and fix until all pass 