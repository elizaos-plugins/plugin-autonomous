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
} from "@elizaos/core";

/**
 * Documentation Research Scenario
 * 
 * This scenario enables the autonomous agent to:
 * 1. Research a technical topic by browsing documentation sites
 * 2. Extract key information from multiple sources
 * 3. Create a comprehensive markdown report
 * 4. Track research progress using TODOs
 */

// Provider that gives the agent context for documentation research
export const documentationResearchProvider: Provider = {
  name: "DOCUMENTATION_RESEARCH_CONTEXT",
  description: "Provides context and goals for documentation research tasks",
  position: 80,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Check if there are any active research tasks
    const researchTasks = await runtime.getTasks({
      tags: ["research", "documentation", "TODO"],
    });

    const activeResearchTasks = researchTasks.filter(
      task => !task.tags?.includes("completed")
    );

    if (activeResearchTasks.length === 0) {
      return {
        text: "No active documentation research tasks.",
        values: {},
        data: {},
      };
    }

    // Format the research tasks
    const tasksText = activeResearchTasks
      .map(task => {
        const topic = (task.metadata?.topic as string) || "unknown topic";
        const sources = (task.metadata?.sources as string[]) || [];
        const progress = (task.metadata?.progress as string) || "not started";
        
        return `Research Task: ${task.name}
Topic: ${topic}
Progress: ${progress}
Sources to check: ${sources.join(", ")}
Report location: ~/research/${topic.replace(/\s+/g, "-")}-report.md`;
      })
      .join("\n\n");

    const contextText = `# Active Documentation Research Tasks

${tasksText}

## Research Guidelines:
1. Visit each source and extract key information
2. Look for: overview, features, installation, usage examples
3. Create structured markdown with clear sections
4. Save findings incrementally
5. Update task progress as you go`;

    return {
      text: contextText,
      values: {
        activeResearchCount: activeResearchTasks.length.toString(),
        researchTasks: tasksText,
      },
      data: {
        researchTasks: activeResearchTasks,
      },
    };
  },
};

// Action to initialize a documentation research task
export const startDocumentationResearchAction: Action = {
  name: "START_DOCUMENTATION_RESEARCH",
  similes: ["RESEARCH_DOCS", "INVESTIGATE_TOPIC", "STUDY_DOCUMENTATION"],
  description: "Initializes a documentation research task for the autonomous agent",
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    // Check if the message contains a research topic
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("research") && (text.includes("documentation") || text.includes("docs"));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<void> => {
    try {
      // Extract the research topic from the message
      const text = message.content.text || "";
      const topicMatch = text.match(/research (?:documentation )?(?:on |about |for )?(.+)/i);
      const topic = topicMatch?.[1] || "ElizaOS plugins";

      // Define default sources based on the topic
      let sources = [
        "https://elizaos.github.io/eliza/docs/",
        "https://github.com/elizaos/eliza",
      ];

      if (topic.toLowerCase().includes("plugin")) {
        sources.push("https://github.com/elizaos-plugins");
      }

      // Create a research TODO task
      const taskId = await runtime.createTask({
        name: `Research documentation: ${topic}`,
        description: `Research and create a comprehensive report about ${topic}`,
        tags: ["TODO", "research", "documentation", "one-off", "priority-2"],
        metadata: {
          topic,
          sources,
          progress: "initialized",
          createdAt: new Date().toISOString(),
        },
        roomId: message.roomId,
      });

      // Create sub-tasks for the research process
      const subTasks = [
        {
          name: `Browse and extract information from documentation sites`,
          description: `Visit ${sources.length} sources and extract key information about ${topic}`,
          tags: ["TODO", "research-subtask", "one-off"],
        },
        {
          name: `Create markdown report structure`,
          description: `Create ~/research/${topic.replace(/\s+/g, "-")}-report.md with proper sections`,
          tags: ["TODO", "research-subtask", "one-off"],
        },
        {
          name: `Compile findings and finalize report`,
          description: `Organize all findings into a comprehensive report`,
          tags: ["TODO", "research-subtask", "one-off"],
        },
      ];

      for (const subTask of subTasks) {
        await runtime.createTask({
          ...subTask,
          metadata: {
            parentTaskId: taskId,
            topic,
          },
          roomId: message.roomId,
        });
      }

      // Also trigger immediate research by updating the agent's context
      const thought = `I've been asked to research documentation about "${topic}". I'll start by creating a research plan and visiting the documentation sources.`;
      const responseText = `I'll research documentation about "${topic}" using these sources:
${sources.map(s => `- ${s}`).join("\n")}

I've created a research task with sub-tasks to track my progress. I'll:
1. Browse each documentation source
2. Extract key information
3. Create a structured markdown report
4. Save it to ~/research/${topic.replace(/\s+/g, "-")}-report.md

Starting the research now...`;

      await callback({
        text: responseText,
        thought,
        actions: ["START_DOCUMENTATION_RESEARCH"],
        source: message.content.source,
      });

    } catch (error) {
      logger.error("Error in startDocumentationResearch handler:", error);
      await callback({
        text: "I encountered an error while setting up the documentation research task.",
        actions: ["START_DOCUMENTATION_RESEARCH_ERROR"],
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "Research documentation on ElizaOS plugin development",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "I'll research documentation about \"ElizaOS plugin development\" using these sources:\n- https://elizaos.github.io/eliza/docs/\n- https://github.com/elizaos/eliza\n- https://github.com/elizaos-plugins\n\nI've created a research task with sub-tasks to track my progress.",
          actions: ["START_DOCUMENTATION_RESEARCH"],
        },
      },
    ],
  ] as ActionExample[][],
};

// Action to check research progress
export const checkResearchProgressAction: Action = {
  name: "CHECK_RESEARCH_PROGRESS",
  similes: ["RESEARCH_STATUS", "DOCUMENTATION_PROGRESS"],
  description: "Checks the progress of ongoing documentation research tasks",
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("research") && text.includes("progress");
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<void> => {
    try {
      // Get all research tasks
      const researchTasks = await runtime.getTasks({
        tags: ["research", "documentation"],
      });

      if (researchTasks.length === 0) {
        await callback({
          text: "No documentation research tasks found.",
          actions: ["CHECK_RESEARCH_PROGRESS"],
          source: message.content.source,
        });
        return;
      }

      // Format progress report
      const progressReport = researchTasks
        .map(task => {
          const status = task.tags?.includes("completed") ? "✅ Completed" : "🔄 In Progress";
          const progress = task.metadata?.progress || "not started";
          const topic = task.metadata?.topic || task.name;
          
          return `${status} ${topic}: ${progress}`;
        })
        .join("\n");

      await callback({
        text: `Documentation Research Progress:\n\n${progressReport}`,
        actions: ["CHECK_RESEARCH_PROGRESS"],
        source: message.content.source,
      });

    } catch (error) {
      logger.error("Error checking research progress:", error);
      await callback({
        text: "I encountered an error while checking research progress.",
        actions: ["CHECK_RESEARCH_PROGRESS_ERROR"],
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "What's the research progress?",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "Documentation Research Progress:\n\n🔄 In Progress ElizaOS plugin development: browsing documentation sites",
          actions: ["CHECK_RESEARCH_PROGRESS"],
        },
      },
    ],
  ] as ActionExample[][],
}; 