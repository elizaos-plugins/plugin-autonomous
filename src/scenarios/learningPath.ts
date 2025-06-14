import {
  type Action,
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  logger,
  type ActionExample,
  type Provider,
} from "@elizaos/core";

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
  name: "LEARNING_PATH_CONTEXT",
  description: "Provides context and progress for active learning paths",
  position: 83,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Check for active learning tasks
    const learningTasks = await runtime.getTasks({
      tags: ["learning", "tutorial", "TODO"],
    });

    const activeTasks = learningTasks.filter(
      task => !task.tags?.includes("completed")
    );

    if (activeTasks.length === 0) {
      return {
        text: "No active learning paths.",
        values: {},
        data: {},
      };
    }

    // Format learning progress
    const progressText = activeTasks
      .map(task => {
        const topic = (task.metadata?.topic as string) || "unknown";
        const currentStep = (task.metadata?.currentStep as number) || 1;
        const totalSteps = (task.metadata?.totalSteps as number) || 0;
        const tutorialUrl = (task.metadata?.tutorialUrl as string) || "";
        
        return `Learning: ${topic}
Progress: Step ${currentStep}/${totalSteps}
Tutorial: ${tutorialUrl}
Notes: ~/learning/${topic.replace(/\s+/g, "-")}/`;
      })
      .join("\n\n");

    const contextText = `# Active Learning Paths

${progressText}

## Learning Guidelines:
1. Follow tutorial step by step
2. Execute all code examples locally
3. Create notes for key concepts
4. Save working examples
5. Track progress with TODO milestones`;

    return {
      text: contextText,
      values: {
        activeLearningPaths: activeTasks.length.toString(),
        learningProgress: progressText,
      },
      data: {
        learningTasks: activeTasks,
      },
    };
  },
};

// Action to start a learning path
export const startLearningPathAction: Action = {
  name: "START_LEARNING_PATH",
  similes: ["LEARN_TUTORIAL", "FOLLOW_COURSE", "STUDY_PROGRAMMING"],
  description: "Starts following a programming tutorial or course",
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || "";
    return (text.includes("learn") || text.includes("tutorial") || text.includes("study")) && 
           (text.includes("programming") || text.includes("code") || text.includes("tutorial"));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<void> => {
    try {
      // Extract topic from message
      const text = message.content.text || "";
      const topicMatch = text.match(/(?:learn|study|tutorial)\s+(?:about\s+)?(.+?)(?:\s+tutorial|\s+programming)?$/i);
      const topic = topicMatch?.[1] || "TypeScript basics";

      // Define tutorial sources based on topic
      let tutorialUrl = "https://www.typescriptlang.org/docs/handbook/intro.html";
      let estimatedSteps = 10;

      if (topic.toLowerCase().includes("react")) {
        tutorialUrl = "https://react.dev/learn";
        estimatedSteps = 15;
      } else if (topic.toLowerCase().includes("python")) {
        tutorialUrl = "https://docs.python.org/3/tutorial/";
        estimatedSteps = 12;
      }

      // Create main learning task
      const taskId = await runtime.createTask({
        name: `Learn ${topic}`,
        description: `Follow tutorial and practice ${topic} with hands-on examples`,
        tags: ["TODO", "learning", "tutorial", "one-off", "priority-3"],
        metadata: {
          topic,
          tutorialUrl,
          currentStep: 1,
          totalSteps: estimatedSteps,
          startedAt: new Date().toISOString(),
          notesPath: `~/learning/${topic.replace(/\s+/g, "-")}/`,
        },
        roomId: message.roomId,
      });

      // Create learning milestones
      const milestones = [
        {
          name: "Set up development environment",
          description: `Install necessary tools and create project directory for ${topic}`,
          step: 1,
        },
        {
          name: "Complete basic concepts",
          description: "Work through introductory sections and basic examples",
          step: Math.floor(estimatedSteps * 0.3),
        },
        {
          name: "Build practice project",
          description: "Create a small project applying learned concepts",
          step: Math.floor(estimatedSteps * 0.7),
        },
        {
          name: "Complete advanced topics",
          description: "Finish remaining sections and create comprehensive notes",
          step: estimatedSteps,
        },
      ];

      for (const milestone of milestones) {
        await runtime.createTask({
          name: milestone.name,
          description: milestone.description,
          tags: ["TODO", "learning-milestone", "one-off"],
          metadata: {
            parentTaskId: taskId,
            topic,
            stepNumber: milestone.step,
          },
          roomId: message.roomId,
        });
      }

      const thought = `I'll start learning ${topic} by following the tutorial step by step. I'll execute all code examples, take notes, and track my progress.`;
      
      const responseText = `I'll start learning ${topic} using this tutorial:
${tutorialUrl}

Learning plan:
1. Set up development environment
2. Work through ${estimatedSteps} tutorial sections
3. Execute all code examples locally
4. Create notes in ~/learning/${topic.replace(/\s+/g, "-")}/
5. Build a practice project

I've created learning milestones to track progress. Let's begin!`;

      await callback({
        text: responseText,
        thought,
        actions: ["START_LEARNING_PATH"],
        source: message.content.source,
      });

    } catch (error) {
      logger.error("Error in startLearningPath handler:", error);
      await callback({
        text: "I encountered an error while setting up the learning path.",
        actions: ["START_LEARNING_PATH_ERROR"],
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "Learn React programming tutorial",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "I'll start learning React using this tutorial:\nhttps://react.dev/learn\n\nLearning plan:\n1. Set up development environment\n2. Work through 15 tutorial sections\n3. Execute all code examples locally\n4. Create notes in ~/learning/React/\n5. Build a practice project",
          actions: ["START_LEARNING_PATH"],
        },
      },
    ],
  ] as ActionExample[][],
}; 