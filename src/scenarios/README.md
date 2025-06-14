# Autonomous Agent Scenarios

This directory contains realistic scenarios for the autonomous agent to execute using the shell, browserbase, and todo plugins.

## Available Scenarios

### 1. Documentation Research Scenario
The agent researches a technical topic (e.g., "ElizaOS plugins"), browses multiple sources, and creates a comprehensive markdown report.

**Skills used:**
- Browser navigation to documentation sites
- Data extraction from web pages
- Shell commands to create and write files
- TODO tracking for research progress

### 2. GitHub Repository Analysis Scenario
The agent discovers trending repositories, analyzes their structure, and creates summaries.

**Skills used:**
- Browser navigation to GitHub
- Shell git commands to clone repos
- File system exploration
- TODO tracking for repositories to analyze

### 3. System Health Monitoring Scenario
The agent monitors system resources and creates maintenance tasks.

**Skills used:**
- Shell commands for system monitoring (df, free, ps)
- TODO creation for maintenance tasks
- Report generation with findings

### 4. Learning Path Scenario
The agent follows a programming tutorial, executes examples, and tracks progress.

**Skills used:**
- Browser navigation to tutorial sites
- Shell commands to run code examples
- TODO tracking for learning milestones
- File creation for notes and examples

## Implementation Details

Each scenario is implemented as:
1. An action that initializes the scenario
2. A provider that gives context and goals
3. Tests that verify the scenario execution

## Communication with the Agent

Users can communicate with the autonomous agent by:
1. Creating TODOs with specific tags (e.g., `#agent-task`)
2. Using the scenario initialization actions
3. Checking generated reports in the filesystem 