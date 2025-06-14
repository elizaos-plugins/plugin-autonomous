# @elizaos/plugin-auto

An autonomous agent plugin for ElizaOS that enables self-directed agent behavior through continuous thought-action loops.

## Overview

The Auto Plugin transforms ElizaOS agents into autonomous entities capable of:
- Self-directed thinking and planning
- Continuous action execution without external prompts
- Reflective processing and decision making
- Maintaining persistent conversation context

This plugin implements an autonomous loop where the agent periodically prompts itself to think, plan, and act, creating a self-sustaining intelligent system.

## Features

- **Autonomous Loop Service**: Configurable interval-based self-prompting system
- **Thought-Action Framework**: Structured XML-based response generation with thoughts, actions, and provider selection
- **Reflective Processing**: Built-in REFLECT action for thoughtful responses
- **Message Feed Provider**: Access to conversation history and context
- **Persistent World State**: Maintains autonomous world and room setup

## Installation

```bash
npm install @elizaos/plugin-auto
```

## Usage

### Basic Setup

Add the plugin to your ElizaOS agent configuration:

```typescript
import { autoPlugin } from "@elizaos/plugin-auto";

const agent = new Agent({
  plugins: [autoPlugin],
  // ... other configuration
});
```

### Configuration

Configure the autonomous loop interval through environment variables:

```bash
# Set the interval between autonomous prompts (in milliseconds)
AUTONOMOUS_LOOP_INTERVAL=5000  # 5 seconds
```

## How It Works

### 1. Autonomous Service Loop

The plugin starts an autonomous service that:
- Creates a persistent world and room for autonomous operations
- Establishes a "Copilot" entity as the autonomous prompt source
- Runs a continuous loop sending periodic prompts

### 2. Message Processing Flow

When an autonomous message is received:

1. **Orientation Phase**: 
   - First message initializes with "I am awake. I am alive..."
   - Subsequent messages use conversation context

2. **Decision Phase**:
   - Composes state with message history
   - Generates XML response with:
     - `thought`: Internal reasoning
     - `text`: Message to articulate
     - `actions`: Actions to execute (comma-separated)
     - `providers`: Data providers to use
     - `evaluators`: Evaluators to run

3. **Action Phase**:
   - Processes specified actions
   - Creates memories of responses

4. **Reflection Phase**:
   - Evaluates outcomes
   - Updates state for next iteration

### 3. Response Structure

The agent generates structured XML responses:

```xml
<response>
    <thought>
        I should check the current system status
    </thought>
    <text>
        Let me examine the system state
    </text>
    <actions>
        CHECK_SYSTEM, ANALYZE_LOGS
    </actions>
    <providers>
        SYSTEM_INFO, LOG_PROVIDER
    </providers>
    <evaluators>
        SYSTEM_HEALTH_EVALUATOR
    </evaluators>
</response>
```

## Components

### Actions

#### REFLECT
Allows the agent to process situations and respond thoughtfully.

```typescript
{
  name: "REFLECT",
  description: "Take a moment to process the current situation and respond thoughtfully",
  // Can be used at the start or end of action chains
}
```

### Providers

#### AUTONOMOUS_FEED
Provides raw feed of messages, interactions, and memories from the autonomous room.

```typescript
{
  name: "AUTONOMOUS_FEED",
  description: "Raw feed of messages, interactions and other memories",
  // Returns formatted conversation history
}
```

### Services

#### AutonomousService
Core service managing the autonomous loop lifecycle.

```typescript
{
  serviceType: "autonomous",
  description: "Maintains the autonomous agent loop",
  // Handles start/stop of autonomous behavior
}
```

## Example Autonomous Prompts

The service randomly selects from various prompts to maintain variety:
- "What should I do next? Think, plan and act."
- "Next action. Go!"
- "What is your immediate next step? Execute."
- "Focus and execute. What is the priority task?"
- "Continue your work. What needs to be done now?"

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Local Development

```bash
# Start with hot reload
npm run dev
```

## Advanced Usage

### Custom Loop Intervals

Adjust the autonomous loop timing based on your use case:

```typescript
// Fast-paced autonomous agent (1 second intervals)
process.env.AUTONOMOUS_LOOP_INTERVAL = "1000";

// Slower, more deliberate agent (30 second intervals)
process.env.AUTONOMOUS_LOOP_INTERVAL = "30000";
```

### Extending Autonomous Behavior

The plugin is designed to work with other ElizaOS plugins. Add custom actions and providers that the autonomous agent can discover and use:

```typescript
const customPlugin = {
  actions: [myCustomAction],
  providers: [myCustomProvider],
};

// The autonomous agent will include these in its decision-making
const agent = new Agent({
  plugins: [autoPlugin, customPlugin],
});
```

## Real-World Scenarios

The plugin includes pre-built scenarios that demonstrate the autonomous agent's capabilities when combined with shell, browserbase, and todo plugins:

### 1. Documentation Research
The agent can research technical topics, browse documentation sites, and create comprehensive reports.

**Example Usage:**
```
"Research documentation on ElizaOS plugin development"
"Research the TypeScript compiler API and create a comprehensive guide"
```

**Capabilities:**
- Browses multiple documentation sources
- Extracts key information
- Creates structured markdown reports
- Tracks research progress with TODOs

### 2. GitHub Repository Analysis
The agent analyzes trending repositories or specific projects, examining code structure and best practices.

**Example Usage:**
```
"Analyze trending GitHub repositories in TypeScript"
"Analyze repository https://github.com/microsoft/TypeScript"
```

**Capabilities:**
- Browses GitHub trending pages
- Clones repositories locally
- Analyzes project structure
- Creates detailed analysis reports

### 3. System Health Monitoring
The agent performs system health checks and creates maintenance tasks for issues.

**Example Usage:**
```
"Check system health status"
"Perform comprehensive system health check with recommendations"
```

**Capabilities:**
- Monitors disk, memory, and CPU usage
- Identifies resource bottlenecks
- Creates cleanup tasks when needed
- Generates health reports

### 4. Learning Path Execution
The agent follows programming tutorials, executes examples, and tracks learning progress.

**Example Usage:**
```
"Learn React programming tutorial"
"Study TypeScript programming basics"
```

**Capabilities:**
- Follows online tutorials step-by-step
- Executes code examples locally
- Takes notes on key concepts
- Tracks progress with learning milestones

### Using Scenarios

To enable scenarios in your autonomous agent:

```typescript
import { autoPlugin } from "@elizaos/plugin-auto";
import { scenariosPlugin } from "@elizaos/plugin-auto/scenarios";
import { shellPlugin } from "@elizaos/plugin-shell";
import { browserbasePlugin } from "@elizaos/plugin-browserbase";
import { todoPlugin } from "@elizaos/plugin-todo";

const agent = new Agent({
  plugins: [
    autoPlugin,
    scenariosPlugin,
    shellPlugin,
    browserbasePlugin,
    todoPlugin
  ],
});
```

## Architecture

```
┌─────────────────────┐
│  Autonomous Loop    │
│  (service.ts)       │
└──────────┬──────────┘
           │ Sends prompts
           ▼
┌─────────────────────┐
│  Event Handler      │
│  (index.ts)         │
└──────────┬──────────┘
           │ Processes
           ▼
┌─────────────────────┐
│  Response Generator │
│  (XML Template)     │
└──────────┬──────────┘
           │ Outputs
           ▼
┌─────────────────────┐
│  Actions/Providers  │
│  (reflect.ts, etc)  │
└─────────────────────┘
```

## Troubleshooting

### Agent Not Starting Autonomous Loop
- Check that the plugin is properly imported and added to the agent configuration
- Verify environment variables are set correctly
- Look for initialization logs: `[AutonomousService] Starting autonomous service...`

### Loop Running Too Fast/Slow
- Adjust `AUTONOMOUS_LOOP_INTERVAL` environment variable
- Default is 1000ms (1 second) if not specified

### Memory/Performance Issues
- For long-running agents, monitor memory usage
- Consider implementing cleanup in extended autonomous sessions
- Adjust conversation length limits if needed

## Contributing

Contributions are welcome! Please ensure:
- Tests pass with `npm test`
- Code follows existing patterns
- Documentation is updated for new features

## License

MIT
