import {
  type Action,
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  logger,
  type ActionExample,
  type Provider,
  createUniqueUuid,
} from '@elizaos/core';

/**
 * Learning Path Scenario
 *
 * This scenario enables the autonomous agent to:
 * 1. Follow programming tutorials online
 * 2. Execute code examples locally
 * 3. Track learning progress with milestones
 * 4. Create notes and example files
 */

// Provider that gives context for learning paths
export const learningPathProvider: Provider = {
  name: 'LEARNING_PATH_CONTEXT',
  description: 'Provides context and progress for active learning paths',
  position: 83,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Since getTasks is not available, return placeholder context
    // The E2E tests check if getTasks is available and skip if not
    const contextText = `# Learning Path Context

This agent can help you learn programming through tutorials.

## Available Commands:
- "Learn React programming tutorial" - Start learning React
- "Learn Python tutorial" - Start learning Python
- "Learn TypeScript basics" - Start learning TypeScript

Learning tasks will be tracked as TODO items.`;

    return {
      text: contextText,
      values: {
        activeLearningPaths: '0',
        learningProgress: 'No active learning paths',
      },
      data: {
        learningTasks: [],
      },
    };
  },
};

// Action to start a learning path
export const startLearningPathAction: Action = {
  name: 'START_LEARNING_PATH',
  similes: ['LEARN_TUTORIAL', 'FOLLOW_COURSE', 'STUDY_PROGRAMMING'],
  description: 'Starts following a programming tutorial or course',

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || '';
    return (
      (text.includes('learn') || text.includes('tutorial') || text.includes('study')) &&
      (text.includes('programming') || text.includes('code') || text.includes('tutorial'))
    );
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<void> => {
    if (!callback) return;

    try {
      // Extract topic from message
      const text = message.content.text || '';
      const topicMatch = text.match(
        /(?:learn|study|tutorial)\s+(?:about\s+)?(.+?)(?:\s+tutorial|\s+programming)?$/i
      );
      const topic = topicMatch?.[1] || 'TypeScript basics';

      // Define tutorial sources based on topic
      let tutorialUrl = 'https://www.typescriptlang.org/docs/handbook/intro.html';
      let estimatedSteps = 10;

      if (topic.toLowerCase().includes('react')) {
        tutorialUrl = 'https://react.dev/learn';
        estimatedSteps = 15;
      } else if (topic.toLowerCase().includes('python')) {
        tutorialUrl = 'https://docs.python.org/3/tutorial/';
        estimatedSteps = 12;
      }

      // Use the message's worldId and roomId
      const worldId = message.worldId || message.roomId; // fallback to roomId if no worldId
      const roomId = message.roomId;

      // Create main learning task as memory
      const taskId = createUniqueUuid(runtime, 'task');
      await runtime.createMemory({
        id: taskId,
        content: {
          text: `Learn ${topic}`,
          description: `Follow tutorial and practice ${topic} with hands-on examples`,
        },
        roomId: roomId,
        worldId: worldId,
        agentId: runtime.agentId,
        entityId: runtime.agentId,
        createdAt: Date.now(),
        metadata: {
          type: 'task',
          name: `Learn ${topic}`,
          description: `Follow tutorial and practice ${topic} with hands-on examples`,
          tags: ['TODO', 'learning', 'tutorial', 'one-off', 'priority-3'],
          topic,
          tutorialUrl,
          currentStep: 1,
          totalSteps: estimatedSteps,
          startedAt: new Date().toISOString(),
          notesPath: `~/learning/${topic.replace(/\s+/g, '-')}/`,
        }
      }, 'knowledge');

      // Create learning milestones
      const milestones = [
        {
          name: 'Set up development environment',
          description: `Install necessary tools and create project directory for ${topic}`,
          step: 1,
        },
        {
          name: 'Complete basic concepts',
          description: 'Work through introductory sections and basic examples',
          step: Math.floor(estimatedSteps * 0.3),
        },
        {
          name: 'Build practice project',
          description: 'Create a small project applying learned concepts',
          step: Math.floor(estimatedSteps * 0.7),
        },
        {
          name: 'Complete advanced topics',
          description: 'Finish remaining sections and create comprehensive notes',
          step: estimatedSteps,
        },
      ];

      for (const milestone of milestones) {
        await runtime.createMemory({
          id: createUniqueUuid(runtime, 'milestone'),
          content: {
            text: milestone.name,
            description: milestone.description,
          },
          roomId: roomId,
          worldId: worldId,
          agentId: runtime.agentId,
          entityId: runtime.agentId,
          createdAt: Date.now(),
          metadata: {
            type: 'task',
            name: milestone.name,
            description: milestone.description,
            tags: ['TODO', 'learning-milestone', 'one-off'],
            parentTaskId: taskId,
            topic,
            stepNumber: milestone.step,
          }
        }, 'knowledge');
      }

      const thought = `I'll start learning ${topic} by following the tutorial step by step. I'll execute all code examples, take notes, and track my progress.`;

      const responseText = `I'll start learning ${topic} using this tutorial:
${tutorialUrl}

Learning plan:
1. Set up development environment
2. Work through ${estimatedSteps} tutorial sections
3. Execute all code examples locally
4. Create notes in ~/learning/${topic.replace(/\s+/g, '-')}/
5. Build a practice project

I've created learning milestones to track progress. Let's begin!`;

      await callback({
        text: responseText,
        thought,
        actions: ['START_LEARNING_PATH'],
        source: message.content.source,
      });
    } catch (error) {
      logger.error('Error in startLearningPath handler:', error);
      await callback({
        text: 'I encountered an error while setting up the learning path.',
        actions: ['START_LEARNING_PATH_ERROR'],
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: '{{user}}',
        content: {
          text: 'Learn React programming tutorial',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: "I'll start learning React using this tutorial:\nhttps://react.dev/learn\n\nLearning plan:\n1. Set up development environment\n2. Work through 15 tutorial sections\n3. Execute all code examples locally\n4. Create notes in ~/learning/React/\n5. Build a practice project",
          actions: ['START_LEARNING_PATH'],
        },
      },
    ],
  ] as ActionExample[][],
};
