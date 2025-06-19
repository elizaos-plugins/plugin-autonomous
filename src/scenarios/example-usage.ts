/**
 * Example Usage: Autonomous Agent with Real-World Scenarios
 *
 * This file demonstrates how to initialize and communicate with
 * an autonomous agent that has access to shell, browserbase, and todo plugins.
 */

import { type IAgentRuntime } from '@elizaos/core';
import { scenariosPlugin } from './index';

/**
 * Initialize the autonomous agent with scenarios
 *
 * The agent will have access to:
 * - Shell commands for system operations
 * - Browser automation for web interactions
 * - TODO management for task tracking
 * - Pre-defined scenarios for common tasks
 */
export async function initializeAutonomousAgent(runtime: IAgentRuntime) {
  // Initialize the scenarios plugin
  await scenariosPlugin.init?.({}, runtime);

  // The agent is now ready to receive commands
  console.log('Autonomous agent initialized with real-world scenarios');
}

/**
 * Example commands to trigger different scenarios
 */
export const EXAMPLE_COMMANDS = {
  // Documentation Research
  research: {
    basic: 'Research documentation on ElizaOS plugin development',
    specific: 'Research the TypeScript compiler API and create a comprehensive guide',
    withSources: 'Research React hooks documentation from official sources',
  },

  // GitHub Analysis
  github: {
    trending: 'Analyze trending GitHub repositories in TypeScript',
    specific: 'Analyze repository https://github.com/microsoft/TypeScript',
    language: 'Explore GitHub repos in Python for machine learning',
  },

  // System Health
  health: {
    check: 'Check system health status',
    monitor: 'Monitor system resources and create health report',
    detailed: 'Perform comprehensive system health check with recommendations',
  },

  // Learning Path
  learning: {
    react: 'Learn React programming tutorial',
    typescript: 'Study TypeScript programming basics',
    python: 'Learn Python tutorial for beginners',
  },
};

/**
 * Example: Triggering multiple scenarios
 *
 * This shows how the autonomous agent can handle multiple
 * concurrent tasks using different plugins
 */
export async function demonstrateAutonomousCapabilities(runtime: IAgentRuntime) {
  // Note: In a real implementation, these messages would be processed
  // through the agent's message handling system. This is a demonstration
  // of the types of tasks the autonomous agent can handle.

  const exampleTasks = [
    'Research the latest TypeScript features and create a tutorial with code examples',
    'Analyze trending React repositories and identify best practices',
    'Check system health and clean up temporary files if disk usage is high',
  ];

  console.log('Autonomous agent can handle tasks like:');
  exampleTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });

  // In practice, these would be triggered through the agent's natural
  // language processing and action system
}

/**
 * Communication patterns with the autonomous agent
 */
export const COMMUNICATION_PATTERNS = {
  // Direct task assignment
  directTask: (task: string) => ({
    text: task,
    expectation: 'Agent will create TODO items and start working autonomously',
  }),

  // Query for status
  statusQuery: () => ({
    text: 'What are you currently working on?',
    expectation: 'Agent will report active tasks and progress',
  }),

  // Modification request
  modifyTask: (taskId: string, modification: string) => ({
    text: `Update task ${taskId}: ${modification}`,
    expectation: 'Agent will update the task and adjust its approach',
  }),

  // Priority change
  prioritize: (topic: string) => ({
    text: `Prioritize ${topic} tasks`,
    expectation: 'Agent will reorder tasks and focus on the specified topic',
  }),
};

/**
 * Monitoring autonomous agent activity
 */
export async function monitorAgentActivity(runtime: IAgentRuntime) {
  // Get all active autonomous tasks
  const activeTasks = await runtime.getTasks({
    tags: ['TODO', 'autonomous'],
  });

  console.log(`Active autonomous tasks: ${activeTasks.length}`);

  // Monitor specific scenario types
  const scenarios = ['research', 'github', 'system-health', 'learning'];

  for (const scenario of scenarios) {
    const scenarioTasks = await runtime.getTasks({
      tags: ['TODO', scenario],
    });

    console.log(`${scenario} tasks: ${scenarioTasks.length}`);

    // Log task details
    scenarioTasks.forEach((task) => {
      console.log(`- ${task.name} (${task.metadata?.status || 'pending'})`);
    });
  }
}

/**
 * Best practices for autonomous agent interaction
 */
export const BEST_PRACTICES = {
  initialization: [
    'Set clear goals through initial tasks',
    'Configure appropriate intervals for autonomous loops',
    'Ensure all required plugins are loaded',
  ],

  communication: [
    'Use clear, specific language in commands',
    'Include context and constraints when relevant',
    'Allow the agent to work autonomously between check-ins',
  ],

  monitoring: [
    'Track task progress through the TODO system',
    'Review generated reports and artifacts',
    'Provide feedback to improve agent performance',
  ],

  safety: [
    'Set appropriate permissions for shell commands',
    'Review browser automation targets',
    'Monitor resource usage during intensive tasks',
  ],
};

// Helper function for generating UUIDs
function generateId(prefix: string): `${string}-${string}-${string}-${string}-${string}` {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}` as `${string}-${string}-${string}-${string}-${string}`;
}
