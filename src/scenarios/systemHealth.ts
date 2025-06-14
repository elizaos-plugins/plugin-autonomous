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
 * System Health Monitoring Scenario
 * 
 * This scenario enables the autonomous agent to:
 * 1. Monitor system resources (disk, memory, CPU)
 * 2. Create maintenance tasks for issues
 * 3. Generate health reports
 * 4. Track system trends
 */

// Provider that gives context for system health monitoring
export const systemHealthProvider: Provider = {
  name: "SYSTEM_HEALTH_CONTEXT",
  description: "Provides system health monitoring context and thresholds",
  position: 82,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Check for active monitoring tasks
    const healthTasks = await runtime.getTasks({
      tags: ["system-health", "monitoring", "TODO"],
    });

    const activeTasks = healthTasks.filter(
      task => !task.tags?.includes("completed")
    );

    const contextText = `# System Health Monitoring

## Thresholds:
- Disk Usage: Alert if > 80%
- Memory Usage: Alert if > 85%
- CPU Load: Alert if > 90% for 5+ minutes

## Monitoring Tasks:
${activeTasks.length > 0 ? activeTasks.map(t => `- ${t.name}`).join("\n") : "No active monitoring tasks"}

## Commands to use:
- df -h (disk usage)
- free -m (memory usage)
- uptime (load average)
- ps aux --sort=-%cpu | head (top CPU processes)
- du -h --max-depth=1 ~ | sort -rh | head (largest directories)`;

    return {
      text: contextText,
      values: {
        activeMonitoringTasks: activeTasks.length.toString(),
      },
      data: {
        healthTasks: activeTasks,
      },
    };
  },
};

// Action to perform system health check
export const systemHealthCheckAction: Action = {
  name: "SYSTEM_HEALTH_CHECK",
  similes: ["CHECK_SYSTEM", "MONITOR_HEALTH", "SYSTEM_STATUS"],
  description: "Performs a comprehensive system health check",
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text?.toLowerCase() || "";
    return text.includes("system") && (text.includes("health") || text.includes("check") || text.includes("status"));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<void> => {
    try {
      // Create health check task
      const taskId = await runtime.createTask({
        name: "Perform system health check",
        description: "Check disk space, memory usage, CPU load, and create maintenance tasks if needed",
        tags: ["TODO", "system-health", "monitoring", "one-off", "priority-2"],
        metadata: {
          checkTime: new Date().toISOString(),
          reportPath: `~/system-health/report-${new Date().toISOString().split('T')[0]}.md`,
        },
        roomId: message.roomId,
      });

      // Create sub-tasks for different checks
      const checks = [
        {
          name: "Check disk usage",
          command: "df -h",
          threshold: "80%",
        },
        {
          name: "Check memory usage",
          command: "free -m",
          threshold: "85%",
        },
        {
          name: "Check system load",
          command: "uptime",
          threshold: "Load > cores",
        },
        {
          name: "Identify large files/directories",
          command: "du -h --max-depth=1 ~ | sort -rh | head -20",
          threshold: "Files > 1GB",
        },
      ];

      for (const check of checks) {
        await runtime.createTask({
          name: check.name,
          description: `Run '${check.command}' and check if exceeds ${check.threshold}`,
          tags: ["TODO", "health-check-subtask", "one-off"],
          metadata: {
            parentTaskId: taskId,
            command: check.command,
            threshold: check.threshold,
          },
          roomId: message.roomId,
        });
      }

      const thought = "I'll perform a comprehensive system health check, monitoring disk space, memory, and CPU usage. I'll create maintenance tasks for any issues found.";
      
      const responseText = `I'll perform a system health check now.

Checks to perform:
1. Disk usage (alert if > 80%)
2. Memory usage (alert if > 85%)
3. CPU load and top processes
4. Large files and directories

I'll create a report at ~/system-health/report-${new Date().toISOString().split('T')[0]}.md

Starting the health check...`;

      await callback({
        text: responseText,
        thought,
        actions: ["SYSTEM_HEALTH_CHECK"],
        source: message.content.source,
      });

    } catch (error) {
      logger.error("Error in systemHealthCheck handler:", error);
      await callback({
        text: "I encountered an error while setting up the system health check.",
        actions: ["SYSTEM_HEALTH_CHECK_ERROR"],
        source: message.content.source,
      });
    }
  },

  examples: [
    [
      {
        name: "{{user}}",
        content: {
          text: "Check system health status",
        },
      },
      {
        name: "{{agent}}",
        content: {
          text: "I'll perform a system health check now.\n\nChecks to perform:\n1. Disk usage (alert if > 80%)\n2. Memory usage (alert if > 85%)\n3. CPU load and top processes\n4. Large files and directories",
          actions: ["SYSTEM_HEALTH_CHECK"],
        },
      },
    ],
  ] as ActionExample[][],
}; 