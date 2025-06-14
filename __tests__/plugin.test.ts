import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { autoPlugin } from '../src/index';
import { logger } from '@elizaos/core';
import dotenv from 'dotenv';

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
    expect(autoPlugin.description).toBe('Auto plugin');
    expect(autoPlugin.tests).toBeDefined();
  });

  it('should have autonomous event handlers', () => {
    expect(autoPlugin.events).toBeDefined();
    expect(autoPlugin.events?.['auto_message_received']).toBeDefined();
    expect(Array.isArray(autoPlugin.events?.['auto_message_received'])).toBe(true);
  });

  it('should have the REFLECT action', () => {
    expect(autoPlugin.actions).toBeDefined();
    expect(autoPlugin.actions?.length).toBeGreaterThan(0);
    const reflectAction = autoPlugin.actions?.find(a => a.name === 'REFLECT');
    expect(reflectAction).toBeDefined();
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
      const action = autoPlugin.actions?.find(a => a.name === actionName);
      expect(action).toBeDefined();
    });
  });

  it('should have the autonomous feed provider', () => {
    expect(autoPlugin.providers).toBeDefined();
    expect(autoPlugin.providers?.length).toBeGreaterThan(0);
    const feedProvider = autoPlugin.providers?.find(p => p.name === 'AUTONOMOUS_FEED');
    expect(feedProvider).toBeDefined();
  });

  it('should have scenario providers', () => {
    const expectedProviders = [
      'DOCUMENTATION_RESEARCH_CONTEXT',
      'GITHUB_ANALYSIS_CONTEXT',
      'SYSTEM_HEALTH_CONTEXT',
      'LEARNING_PATH_CONTEXT'
    ];

    expectedProviders.forEach(providerName => {
      const provider = autoPlugin.providers?.find(p => p.name === providerName);
      expect(provider).toBeDefined();
    });
  });

  it('should have the AutonomousService', () => {
    expect(autoPlugin.services).toBeDefined();
    expect(autoPlugin.services?.length).toBeGreaterThan(0);
    expect(autoPlugin.services?.[0].serviceType).toBe('autonomous');
  });

  it('should have e2e tests exported', () => {
    expect(autoPlugin.tests).toBeDefined();
    expect(Array.isArray(autoPlugin.tests)).toBe(true);
    expect(autoPlugin.tests?.length).toBeGreaterThan(0);
    
    const testSuite = autoPlugin.tests?.[0];
    expect(testSuite?.name).toBe('Autonomous Agent Scenarios E2E Tests');
    expect(testSuite?.tests?.length).toBe(5);
  });
});

describe('Auto Plugin Actions', () => {
  it('should have valid REFLECT action structure', () => {
    const reflectAction = autoPlugin.actions?.find(a => a.name === 'REFLECT');
    expect(reflectAction).toBeDefined();
    expect(reflectAction?.description).toContain('process the current situation');
    expect(reflectAction?.validate).toBeDefined();
    expect(reflectAction?.handler).toBeDefined();
    expect(reflectAction?.examples).toBeDefined();
  });

  it('should have valid documentation research action', () => {
    const action = autoPlugin.actions?.find(a => a.name === 'START_DOCUMENTATION_RESEARCH');
    expect(action).toBeDefined();
    expect(action?.description).toContain('documentation research');
    expect(action?.validate).toBeDefined();
    expect(action?.handler).toBeDefined();
  });
});

describe('Auto Plugin Providers', () => {
  it('should have valid autonomous feed provider structure', () => {
    const provider = autoPlugin.providers?.find(p => p.name === 'AUTONOMOUS_FEED');
    expect(provider).toBeDefined();
    expect(provider?.description).toContain('Raw feed of messages');
    expect(provider?.get).toBeDefined();
  });

  it('should have valid scenario context providers', () => {
    const provider = autoPlugin.providers?.find(p => p.name === 'DOCUMENTATION_RESEARCH_CONTEXT');
    expect(provider).toBeDefined();
    expect(provider?.description).toContain('documentation research');
    expect(provider?.get).toBeDefined();
  });
});
