import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { autoPlugin } from '../src/index';
import { logger } from '@elizaos/core';
import dotenv from 'dotenv';
import { reflectAction } from '../src/reflect';
import { 
  startDocumentationResearchAction,
  checkResearchProgressAction,
  startGithubAnalysisAction,
  analyzeSpecificRepoAction,
  systemHealthCheckAction,
  startLearningPathAction,
} from '../src/scenarios';
import { autonomousFeedProvider } from '../src/messageFeed';
import {
  documentationResearchProvider,
  githubAnalysisProvider,
  systemHealthProvider,
  learningPathProvider,
} from '../src/scenarios';
import { OODALoopService } from '../src/ooda-service';

// Setup environment variables
dotenv.config();

// Spy on logger for testing
beforeAll(() => {
  vi.spyOn(logger, 'info');
  vi.spyOn(logger, 'error');
  vi.spyOn(logger, 'warn');
  vi.spyOn(logger, 'debug');
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Auto Plugin Configuration', () => {
  it('should have correct plugin metadata', () => {
    expect(autoPlugin.name).toBe('auto');
    expect(autoPlugin.description).toBe('Autonomous operations plugin with OODA loop decision-making and real action execution');
    expect(autoPlugin.tests).toBeDefined();
  });

  it('should have the OODA service instead of event handlers', () => {
    // The new OODA implementation doesn't use event handlers
    expect(autoPlugin.events).toBeUndefined();
    expect(autoPlugin.services).toBeDefined();
    expect(autoPlugin.services).toContain(OODALoopService);
  });

  it('should have the REFLECT action', () => {
    expect(autoPlugin.actions).toBeDefined();
    const reflectActionExists = autoPlugin.actions?.some(
      action => action.name === 'REFLECT'
    );
    expect(reflectActionExists).toBe(true);
  });

  it('should have scenario actions', () => {
    const expectedActions = [
      'START_DOCUMENTATION_RESEARCH',
      'CHECK_RESEARCH_PROGRESS',
      'START_GITHUB_ANALYSIS',
      'ANALYZE_SPECIFIC_REPO',
      'SYSTEM_HEALTH_CHECK',
      'START_LEARNING_PATH'
    ];

    expectedActions.forEach(actionName => {
      const actionExists = autoPlugin.actions?.some(
        action => action.name === actionName
      );
      expect(actionExists).toBe(true);
    });
  });

  it('should have the autonomous feed provider', () => {
    expect(autoPlugin.providers).toBeDefined();
    const feedProviderExists = autoPlugin.providers?.some(
      provider => provider.name === 'AUTONOMOUS_FEED'
    );
    expect(feedProviderExists).toBe(true);
  });

  it('should have scenario providers', () => {
    const expectedProviders = [
      'DOCUMENTATION_RESEARCH_CONTEXT',
      'GITHUB_ANALYSIS_CONTEXT',
      'SYSTEM_HEALTH_CONTEXT',
      'LEARNING_PATH_CONTEXT'
    ];

    expectedProviders.forEach(providerName => {
      const providerExists = autoPlugin.providers?.some(
        provider => provider.name === providerName
      );
      expect(providerExists).toBe(true);
    });
  });

  it('should have the OODALoopService', () => {
    expect(autoPlugin.services).toBeDefined();
    expect(autoPlugin.services?.length).toBeGreaterThan(0);
    
    // Check if OODALoopService is included
    const hasOODAService = autoPlugin.services?.some(
      service => service === OODALoopService || service.serviceType === 'autonomous'
    );
    expect(hasOODAService).toBe(true);
  });

  it('should have e2e tests exported', () => {
    expect(autoPlugin.tests).toBeDefined();
    expect(Array.isArray(autoPlugin.tests)).toBe(true);
    
    // Check for scenario tests and OODA tests
    const hasTests = autoPlugin.tests && autoPlugin.tests.length > 0;
    expect(hasTests).toBe(true);
  });
});

describe('Auto Plugin Actions', () => {
  it('should have valid REFLECT action structure', () => {
    expect(reflectAction).toBeDefined();
    expect(reflectAction.name).toBe('REFLECT');
    expect(reflectAction.similes).toContain('REFLECTION');
    expect(reflectAction.description).toContain('process the current situation');
    expect(reflectAction.validate).toBeDefined();
    expect(reflectAction.handler).toBeDefined();
    expect(reflectAction.examples).toBeDefined();
    expect(Array.isArray(reflectAction.examples)).toBe(true);
  });

  it('should have valid documentation research action', () => {
    expect(startDocumentationResearchAction).toBeDefined();
    expect(startDocumentationResearchAction.name).toBe('START_DOCUMENTATION_RESEARCH');
    expect(startDocumentationResearchAction.validate).toBeDefined();
    expect(startDocumentationResearchAction.handler).toBeDefined();
  });
});

describe('Auto Plugin Providers', () => {
  it('should have valid autonomous feed provider structure', () => {
    expect(autonomousFeedProvider).toBeDefined();
    expect(autonomousFeedProvider.name).toBe('AUTONOMOUS_FEED');
    expect(autonomousFeedProvider.description).toContain('feed of messages');
    expect(autonomousFeedProvider.get).toBeDefined();
    expect(typeof autonomousFeedProvider.get).toBe('function');
  });

  it('should have valid scenario context providers', () => {
    const providers = [
      { provider: documentationResearchProvider, name: 'DOCUMENTATION_RESEARCH_CONTEXT' },
      { provider: githubAnalysisProvider, name: 'GITHUB_ANALYSIS_CONTEXT' },
      { provider: systemHealthProvider, name: 'SYSTEM_HEALTH_CONTEXT' },
      { provider: learningPathProvider, name: 'LEARNING_PATH_CONTEXT' }
    ];

    providers.forEach(({ provider, name }) => {
      expect(provider).toBeDefined();
      expect(provider.name).toBe(name);
      expect(provider.get).toBeDefined();
      expect(typeof provider.get).toBe('function');
    });
  });
});
