import { type IAgentRuntime, type Memory, createUniqueUuid } from '@elizaos/core';

export const systemHealthE2ETest = {
  name: 'system-health-e2e',
  description: 'E2E test for system health monitoring scenario',
  fn: async (runtime: IAgentRuntime) => {
    console.log('Starting System Health E2E Test...');

    try {
      const testRoomId = createUniqueUuid(runtime, 'test-room');

      // Test 1: Perform system health check
      console.log('Test 1: Performing system health check...');

      const healthMessage: Memory = {
        id: createUniqueUuid(runtime, 'test-health'),
        content: {
          text: 'Check system health status',
          source: 'test',
        },
        roomId: testRoomId,
        agentId: runtime.agentId,
        entityId: runtime.agentId,
        createdAt: Date.now(),
      };

      // Find the health check action
      const healthAction = runtime.actions.find((action) => action.name === 'SYSTEM_HEALTH_CHECK');

      if (!healthAction) {
        throw new Error('SYSTEM_HEALTH_CHECK action not found');
      }

      // Validate and execute
      const isValid = await healthAction.validate(runtime, healthMessage);
      if (!isValid) {
        throw new Error('Health check message validation failed');
      }

      const state = await runtime.composeState(healthMessage);
      const callback = async (response: any) => {
        console.log('Action response:', response.text);
        return [];
      };

      await healthAction.handler(runtime, healthMessage, state, {}, callback);

      // Wait for tasks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if getTasks is available
      if (typeof runtime.getTasks !== 'function') {
        console.warn(
          '⚠️ Warning: runtime.getTasks() is not available. This method is provided by @elizaos/plugin-sql.'
        );
        console.warn('⚠️ Skipping task verification tests.');
        console.log('✅ System Health E2E Test PASSED (with warnings)\n');
        return;
      }

      // Verify health check tasks
      const healthTasks = await runtime.getTasks({
        tags: ['system-health', 'monitoring', 'TODO'],
      });

      if (healthTasks.length === 0) {
        throw new Error('No system health tasks were created');
      }

      console.log(`✓ Created ${healthTasks.length} system health tasks`);

      // Test 2: Verify sub-tasks with commands
      console.log('Test 2: Verifying health check sub-tasks...');

      const subTasks = await runtime.getTasks({
        tags: ['health-check-subtask', 'TODO'],
      });

      if (subTasks.length === 0) {
        throw new Error('No health check sub-tasks were created');
      }

      // Check for expected commands
      const expectedCommands = ['df -h', 'free -m', 'uptime'];
      const foundCommands = subTasks
        .map((task) => task.metadata?.command as string)
        .filter((cmd) => cmd);

      const hasExpectedCommands = expectedCommands.every((cmd) =>
        foundCommands.some((found) => found === cmd)
      );

      if (!hasExpectedCommands) {
        throw new Error('Not all expected monitoring commands were created');
      }

      console.log('✓ Health check sub-tasks contain expected commands');

      // Test 3: Check system health context provider
      console.log('Test 3: Checking system health context provider...');

      const healthProvider = runtime.providers.find((p) => p.name === 'SYSTEM_HEALTH_CONTEXT');

      if (!healthProvider) {
        throw new Error('SYSTEM_HEALTH_CONTEXT provider not found');
      }

      const context = await healthProvider.get(runtime, healthMessage, state);

      if (!context.text?.includes('System Health Monitoring')) {
        throw new Error('Provider context does not include monitoring information');
      }

      if (!context.text?.includes('df -h')) {
        throw new Error('Provider context does not include monitoring commands');
      }

      console.log('✓ System health context provider returns monitoring information');

      console.log('✅ System Health E2E Test PASSED\n');
    } catch (error) {
      console.error('❌ System Health E2E Test FAILED:', error);
      throw error;
    }
  },
};
