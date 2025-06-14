import { type TestSuite } from "@elizaos/core";
import { documentationResearchE2ETest } from "./documentationResearch.e2e";
import { githubAnalysisE2ETest } from "./githubAnalysis.e2e";
import { systemHealthE2ETest } from "./systemHealth.e2e";
import { learningPathE2ETest } from "./learningPath.e2e";
import { scenariosIntegrationE2ETest } from "./scenariosIntegration.e2e";

// Export individual tests
export {
  documentationResearchE2ETest,
  githubAnalysisE2ETest,
  systemHealthE2ETest,
  learningPathE2ETest,
  scenariosIntegrationE2ETest,
};

// Export test suite for the scenarios plugin
export const scenarioTests: TestSuite[] = [
  {
    name: "Autonomous Agent Scenarios E2E Tests",
    tests: [
      documentationResearchE2ETest,
      githubAnalysisE2ETest,
      systemHealthE2ETest,
      learningPathE2ETest,
      scenariosIntegrationE2ETest,
    ],
  },
]; 