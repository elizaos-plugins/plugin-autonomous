/// <reference types="cypress" />
import React from 'react';
import { OODAMonitor } from '../OODAMonitor';

describe('OODAMonitor Component', () => {
  const mockAgentId = 'test-agent-123';
  const mockApiUrl = 'http://localhost:3000';

  beforeEach(() => {
    // Mock the fetch responses
    cy.intercept('GET', `${mockApiUrl}/autonomy/${mockAgentId}/status`, {
      statusCode: 200,
      body: {
        isRunning: true,
        currentPhase: 'DECIDING',
        lastRunTime: new Date().toISOString(),
        metrics: {
          cycleTime: 5432,
          decisionsPerCycle: 3,
          actionSuccessRate: 0.85,
          errorRate: 0.05,
          resourceEfficiency: 0.78,
          goalProgress: 0.65,
        },
      },
    }).as('getStatus');

    cy.intercept('GET', `${mockApiUrl}/autonomy/${mockAgentId}/recent-runs`, {
      statusCode: 200,
      body: {
        runs: [
          {
            runId: 'run-1',
            startTime: new Date(Date.now() - 30000).toISOString(),
            endTime: new Date(Date.now() - 25000).toISOString(),
            success: true,
            phase: 'REFLECTING',
            decisions: 2,
            errors: 0,
          },
          {
            runId: 'run-2',
            startTime: new Date(Date.now() - 60000).toISOString(),
            endTime: new Date(Date.now() - 55000).toISOString(),
            success: false,
            phase: 'ACTING',
            decisions: 1,
            errors: 1,
          },
        ],
      },
    }).as('getRecentRuns');

    cy.intercept('POST', `${mockApiUrl}/autonomy/${mockAgentId}/control`, {
      statusCode: 200,
      body: { success: true },
    }).as('controlService');
  });

  it('should display the OODA Monitor interface', () => {
    cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);

    // Check main elements
    cy.get('h2').should('contain', 'OODA Loop Monitor');
    cy.get('.status-badge').should('exist');
    cy.get('.metrics-grid').should('exist');
    cy.get('.recent-runs').should('exist');
  });

  it('should show running status with correct phase color', () => {
    cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
    cy.wait('@getStatus');

    // Check status badge
    cy.get('.status-badge').should('contain', 'Running');
    cy.get('.phase-indicator').should('contain', 'DECIDING');
    cy.get('.phase-indicator').should('have.css', 'color', 'rgb(255, 193, 7)'); // Warning color for DECIDING
  });

  it('should display metrics correctly', () => {
    cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
    cy.wait('@getStatus');

    // Check metrics display
    cy.get('.metric-item').should('have.length', 6);
    cy.get('.metric-item').contains('Cycle Time').next().should('contain', '5.4s');
    cy.get('.metric-item').contains('Success Rate').next().should('contain', '85%');
    cy.get('.metric-item').contains('Error Rate').next().should('contain', '5%');
    cy.get('.metric-item').contains('Resource Efficiency').next().should('contain', '78%');
  });

  it('should start and stop the OODA loop', () => {
    cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
    cy.wait('@getStatus');

    // Test stop button
    cy.get('button').contains('Stop').click();
    cy.wait('@controlService').then((interception) => {
      expect(interception.request.body).to.deep.equal({ action: 'stop' });
    });

    // Update status to stopped
    cy.intercept('GET', `${mockApiUrl}/autonomy/${mockAgentId}/status`, {
      statusCode: 200,
      body: {
        isRunning: false,
        currentPhase: 'IDLE',
        lastRunTime: new Date().toISOString(),
        metrics: {},
      },
    }).as('getStatusStopped');

    // Test start button
    cy.get('button').contains('Start').click();
    cy.wait('@controlService').then((interception) => {
      expect(interception.request.body).to.deep.equal({ action: 'start' });
    });
  });

  it('should display recent runs with success/failure indicators', () => {
    cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
    cy.wait('@getRecentRuns');

    // Check recent runs display
    cy.get('.run-item').should('have.length', 2);

    // First run (success)
    cy.get('.run-item')
      .first()
      .within(() => {
        cy.get('.run-status').should('contain', '✓');
        cy.get('.run-status').should('have.css', 'color', 'rgb(40, 167, 69)'); // Success color
        cy.get('.run-details').should('contain', '5s');
        cy.get('.run-details').should('contain', '2 decisions');
      });

    // Second run (failure)
    cy.get('.run-item')
      .last()
      .within(() => {
        cy.get('.run-status').should('contain', '✗');
        cy.get('.run-status').should('have.css', 'color', 'rgb(220, 53, 69)'); // Danger color
        cy.get('.run-details').should('contain', '1 error');
      });
  });

  it('should auto-refresh data every 2 seconds', () => {
    cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
    cy.wait('@getStatus');
    cy.wait('@getRecentRuns');

    // Wait for auto-refresh
    cy.wait(2100);
    cy.wait('@getStatus');
    cy.wait('@getRecentRuns');

    // Verify it was called again
    cy.get('@getStatus.all').should('have.length', 2);
    cy.get('@getRecentRuns.all').should('have.length', 2);
  });

  it('should handle API errors gracefully', () => {
    // Mock error response
    cy.intercept('GET', `${mockApiUrl}/autonomy/${mockAgentId}/status`, {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getStatusError');

    cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
    cy.wait('@getStatusError');

    // Should show error state
    cy.get('.error-message').should('contain', 'Failed to load status');
  });

  it('should show correct phase colors for all phases', () => {
    const phases = [
      { phase: 'OBSERVING', color: 'rgb(0, 123, 255)' }, // Primary
      { phase: 'ORIENTING', color: 'rgb(23, 162, 184)' }, // Info
      { phase: 'DECIDING', color: 'rgb(255, 193, 7)' }, // Warning
      { phase: 'ACTING', color: 'rgb(40, 167, 69)' }, // Success
      { phase: 'REFLECTING', color: 'rgb(108, 117, 125)' }, // Secondary
    ];

    phases.forEach(({ phase, color }) => {
      cy.intercept('GET', `${mockApiUrl}/autonomy/${mockAgentId}/status`, {
        statusCode: 200,
        body: {
          isRunning: true,
          currentPhase: phase,
          lastRunTime: new Date().toISOString(),
          metrics: {},
        },
      }).as(`getStatus${phase}`);

      cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
      cy.wait(`@getStatus${phase}`);

      cy.get('.phase-indicator').should('contain', phase);
      cy.get('.phase-indicator').should('have.css', 'color', color);
    });
  });

  it('should format durations correctly', () => {
    const testCases = [
      { ms: 500, expected: '0.5s' },
      { ms: 1500, expected: '1.5s' },
      { ms: 65000, expected: '1m 5s' },
      { ms: 3665000, expected: '1h 1m' },
    ];

    testCases.forEach(({ ms, expected }) => {
      cy.intercept('GET', `${mockApiUrl}/autonomy/${mockAgentId}/status`, {
        statusCode: 200,
        body: {
          isRunning: true,
          currentPhase: 'OBSERVING',
          lastRunTime: new Date().toISOString(),
          metrics: {
            cycleTime: ms,
          },
        },
      }).as('getStatusWithTime');

      cy.mount(<OODAMonitor agentId={mockAgentId} apiUrl={mockApiUrl} />);
      cy.wait('@getStatusWithTime');

      cy.get('.metric-item').contains('Cycle Time').next().should('contain', expected);
    });
  });
});
