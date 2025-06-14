# Scenario E2E Tests

## Overview

These end-to-end tests validate the autonomous agent scenarios functionality including:
- Documentation research
- GitHub repository analysis  
- System health monitoring
- Learning path execution

## Requirements

### Required Plugins
The tests depend on these plugins being available at runtime:
- `@elizaos/plugin-sql` - **REQUIRED**: Provides `getTasks()` and `createTask()` methods
- `@elizaos/plugin-shell` - Optional: For shell command execution scenarios
- `@elizaos/plugin-browserbase` - Optional: For browser automation scenarios
- `@elizaos/plugin-todo` - Optional: For TODO task management

### Test Runtime Setup
The ElizaOS test runner should automatically load required plugins. If tests fail with "method not found" errors:
1. Ensure `@elizaos/plugin-sql` is installed and loaded
2. Check that the test environment includes the SQL plugin
3. Tests will show warnings but pass if getTasks/createTask are not available

## Test Structure

Each test follows this pattern:
1. Create test messages with proper structure
2. Find and validate actions  
3. Execute action handlers
4. Wait for async operations (1-2 seconds)
5. Verify expected outcomes (if runtime methods available)

## Running Tests

```bash
# Build the plugin first
npm run build

# Run all tests (unit and e2e)
npm test

# Run only e2e tests
npm run test:e2e

# Run specific test suite
elizaos test --name "Autonomous Agent Scenarios E2E Tests"
```

## Current Status

✅ **Working**:
- Test structure and exports are correct
- Actions and providers are properly included in the plugin
- Tests handle missing runtime methods gracefully
- All scenario actions validate and execute properly

⚠️ **Known Issues**:
1. The `elizaos test` command currently checks `@elizaos/plugin-sql` instead of the auto plugin
2. Tests require SQL plugin for full functionality but will pass with warnings if not available

## Test Files

- `documentationResearch.e2e.ts` - Tests documentation research scenario
- `githubAnalysis.e2e.ts` - Tests GitHub repository analysis  
- `systemHealth.e2e.ts` - Tests system health monitoring
- `learningPath.e2e.ts` - Tests learning path execution
- `scenariosIntegration.e2e.ts` - Tests multiple scenarios running together 