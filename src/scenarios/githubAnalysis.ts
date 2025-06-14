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
 * GitHub Repository Analysis Scenario
 * 
 * This scenario enables the autonomous agent to:
 * 1. Browse GitHub for trending repositories
 * 2. Clone and analyze repository structure
 * 3. Create summaries of interesting projects
 * 4. Track repositories to analyze
 */

// Provider that gives context for GitHub analysis tasks
export const githubAnalysisProvider: Provider = {
  name: "GITHUB_ANALYSIS_CONTEXT",
  description: "Provides context and goals for GitHub repository analysis",
  position: 81,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Check for active GitHub analysis tasks
    const analysisTasks = await runtime.getTasks({
      tags: ["github", "analysis", "TODO"],
    });

    const activeTasks = analysisTasks.filter(
      task => !task.tags?.includes("completed")
    );

    if (activeTasks.length === 0) {
      return {
        text: "No active GitHub repository analysis tasks.",
        values: {},
        data: {},
      };
    }

    // Format the analysis tasks
    const tasksText = activeTasks
      .map(task => {
        const repoUrl = (task.metadata?.repoUrl as string) || "";
        const language = (task.metadata?.language as string) || "any";
        const status = (task.metadata?.status as string) || "pending";
        
        return `Repository: ${task.name}
URL: ${repoUrl}
Language: ${language}
Status: ${status}`;
      })
      .join("\n\n");

    const contextText = `# Active GitHub Repository Analysis Tasks

${tasksText}

## Analysis Guidelines:
1. Browse GitHub trending repositories
2. Look for: stars, language, recent activity, documentation quality
3. Clone interesting repositories using git
4. Analyze: structure, dependencies, documentation
5. Create summary reports in ~/github-analysis/`;

    return {
      text: contextText,
      values: {
        activeAnalysisCount: activeTasks.length.toString(),
        analysisTasks: tasksText,
      },
      data: {
        analysisTasks: activeTasks,
      },
    };
  },
};

// Action to start GitHub repository analysis
export const startGithubAnalysisAction: Action = {
  name: "START_GITHUB_ANALYSIS",
  similes: ["ANALYZE_GITHUB", "EXPLORE_REPOS", "GITHUB_RESEARCH"],
  description: "Initializes a GitHub repository analysis task",
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("github") && (text.includes("analyze") || text.includes("explore") || text.includes("trending"));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<void> => {
    try {
      // Extract language preference if specified
      const text = message.content.text || "";
      const languageMatch = text.match(/(?:in|for|with)\s+(\w+)(?:\s+language)?/i);
      const language = languageMatch?.[1] || "any";

      // Create main analysis task
      const taskId = await runtime.createTask({
        name: `Analyze trending GitHub repositories${language !== "any" ? ` (${language})` : ""}`,
        description: `Explore and analyze trending repositories on GitHub`,
        tags: ["TODO", "github", "analysis", "one-off", "priority-3"],
        metadata: {
          language,
          status: "initialized",
          createdAt: new Date().toISOString(),
          analysisDir: `~/github-analysis/${new Date().toISOString().split('T')[0]}`,
        },
        roomId: message.roomId,
      });

      // Create sub-tasks
      const subTasks = [
        {
          name: "Browse GitHub trending page",
          description: `Navigate to GitHub trending${language !== "any" ? ` for ${language}` : ""} and identify interesting repositories`,
          tags: ["TODO", "github-subtask", "one-off"],
        },
        {
          name: "Clone and analyze top repositories",
          description: "Clone selected repositories and analyze their structure",
          tags: ["TODO", "github-subtask", "one-off"],
        },
        {
          name: "Create repository summary reports",
          description: "Generate markdown summaries for analyzed repositories",
          tags: ["TODO", "github-subtask", "one-off"],
        },
      ];

      for (const subTask of subTasks) {
        await runtime.createTask({
          ...subTask,
          metadata: {
            parentTaskId: taskId,
            language,
          },
          roomId: message.roomId,
        });
      }

      const thought = `I've been asked to analyze trending GitHub repositories${language !== "any" ? ` for ${language}` : ""}. I'll browse GitHub, identify interesting projects, and create detailed analyses.`;
      
      const responseText = `I'll analyze trending GitHub repositories${language !== "any" ? ` for ${language}` : ""}. 

My plan:
1. Browse GitHub trending page
2. Identify repositories with good documentation and activity
3. Clone the most interesting ones
4. Analyze their structure, dependencies, and code quality
5. Create summary reports in ~/github-analysis/

Starting the analysis now...`;

      await callback({
        text: responseText,
        thought,
        actions: ["START_GITHUB_ANALYSIS"],
        source: message.content.source,
      });

    } catch (error) {
      logger.error("Error in startGithubAnalysis handler:", error);
      await callback({
        text: "I encountered an error while setting up the GitHub analysis task.",
        actions: ["START_GITHUB_ANALYSIS_ERROR"],
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "Analyze trending GitHub repositories in TypeScript",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "I'll analyze trending GitHub repositories for TypeScript.\n\nMy plan:\n1. Browse GitHub trending page\n2. Identify repositories with good documentation and activity\n3. Clone the most interesting ones\n4. Analyze their structure, dependencies, and code quality\n5. Create summary reports in ~/github-analysis/",
          actions: ["START_GITHUB_ANALYSIS"],
        },
      },
    ],
  ] as ActionExample[][],
};

// Action to analyze a specific repository
export const analyzeSpecificRepoAction: Action = {
  name: "ANALYZE_SPECIFIC_REPO",
  similes: ["ANALYZE_REPO", "EXAMINE_REPOSITORY"],
  description: "Analyzes a specific GitHub repository",
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("analyze") && (text.includes("github.com/") || text.includes("repository"));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<void> => {
    try {
      // Extract repository URL
      const text = message.content.text || "";
      const urlMatch = text.match(/(?:analyze\s+)?(?:repository\s+)?(https?:\/\/github\.com\/[\w-]+\/[\w-]+)/i);
      
      if (!urlMatch) {
        await callback({
          text: "Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo)",
          actions: ["ANALYZE_SPECIFIC_REPO_INVALID"],
          source: message.content.source,
        });
        return;
      }

      const repoUrl = urlMatch[1];
      const repoName = repoUrl.split('/').slice(-2).join('/');

      // Create analysis task
      const taskId = await runtime.createTask({
        name: `Analyze repository: ${repoName}`,
        description: `Deep analysis of ${repoUrl}`,
        tags: ["TODO", "github", "analysis", "specific-repo", "one-off", "priority-2"],
        metadata: {
          repoUrl,
          repoName,
          status: "initialized",
          createdAt: new Date().toISOString(),
        },
        roomId: message.roomId,
      });

      const thought = `I'll analyze the GitHub repository at ${repoUrl}. I'll clone it, examine its structure, dependencies, and create a detailed report.`;
      
      const responseText = `I'll analyze the repository: ${repoName}

Steps:
1. Clone the repository
2. Analyze project structure and file organization
3. Examine README and documentation
4. Check dependencies and build configuration
5. Create a detailed analysis report

Starting the analysis...`;

      await callback({
        text: responseText,
        thought,
        actions: ["ANALYZE_SPECIFIC_REPO"],
        source: message.content.source,
      });

    } catch (error) {
      logger.error("Error in analyzeSpecificRepo handler:", error);
      await callback({
        text: "I encountered an error while setting up the repository analysis.",
        actions: ["ANALYZE_SPECIFIC_REPO_ERROR"],
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "Analyze repository https://github.com/elizaos/eliza",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "I'll analyze the repository: elizaos/eliza\n\nSteps:\n1. Clone the repository\n2. Analyze project structure and file organization\n3. Examine README and documentation\n4. Check dependencies and build configuration\n5. Create a detailed analysis report",
          actions: ["ANALYZE_SPECIFIC_REPO"],
        },
      },
    ],
  ] as ActionExample[][],
}; 