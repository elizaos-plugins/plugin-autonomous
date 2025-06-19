import React, { useState, useEffect } from 'react';
import { OODAPhase, type OODAContext, type LoopMetrics } from '../types';

interface OODAMonitorProps {
  apiEndpoint?: string;
}

interface OODAStatus {
  isRunning: boolean;
  currentPhase: OODAPhase;
  currentRunId: string | null;
  recentRuns: OODARunSummary[];
  metrics: LoopMetrics | null;
}

interface OODARunSummary {
  runId: string;
  startTime: number;
  endTime?: number;
  decisions: number;
  actions: number;
  errors: number;
  success: boolean;
}

export const OODAMonitor: React.FC<OODAMonitorProps> = ({
  apiEndpoint = '/api/autonomy/status',
}) => {
  const [status, setStatus] = useState<OODAStatus>({
    isRunning: false,
    currentPhase: OODAPhase.IDLE,
    currentRunId: null,
    recentRuns: [],
    metrics: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch status from API
  const fetchStatus = async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle OODA loop
  const toggleLoop = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}/toggle`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to toggle loop');
      }
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Auto-refresh status
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const getPhaseColor = (phase: OODAPhase) => {
    switch (phase) {
      case OODAPhase.OBSERVING:
        return '#3b82f6'; // blue
      case OODAPhase.ORIENTING:
        return '#8b5cf6'; // purple
      case OODAPhase.DECIDING:
        return '#f59e0b'; // amber
      case OODAPhase.ACTING:
        return '#10b981'; // emerald
      case OODAPhase.REFLECTING:
        return '#6366f1'; // indigo
      default:
        return '#6b7280'; // gray
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (isLoading && status.recentRuns.length === 0) {
    return <div className="ooda-monitor loading">Loading...</div>;
  }

  return (
    <div className="ooda-monitor" data-cy="ooda-monitor">
      <div className="header">
        <h2>OODA Loop Monitor</h2>
        <button
          className={`toggle-button ${status.isRunning ? 'stop' : 'start'}`}
          onClick={toggleLoop}
          disabled={isLoading}
          data-cy="toggle-button"
        >
          {status.isRunning ? 'Stop Loop' : 'Start Loop'}
        </button>
      </div>

      {error && (
        <div className="error-message" data-cy="error-message">
          Error: {error}
        </div>
      )}

      <div className="status-section">
        <h3>Current Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <label>Status:</label>
            <span className={`status-value ${status.isRunning ? 'running' : 'stopped'}`}>
              {status.isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="status-item">
            <label>Phase:</label>
            <span className="phase-value" style={{ color: getPhaseColor(status.currentPhase) }}>
              {status.currentPhase}
            </span>
          </div>
          <div className="status-item">
            <label>Current Run:</label>
            <span className="run-id">
              {status.currentRunId ? status.currentRunId.substring(0, 8) : 'None'}
            </span>
          </div>
        </div>
      </div>

      {status.metrics && (
        <div className="metrics-section">
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric">
              <label>Cycle Time:</label>
              <span>{formatDuration(status.metrics.cycleTime)}</span>
            </div>
            <div className="metric">
              <label>Decisions/Cycle:</label>
              <span>{status.metrics.decisionsPerCycle}</span>
            </div>
            <div className="metric">
              <label>Success Rate:</label>
              <span>{(status.metrics.actionSuccessRate * 100).toFixed(1)}%</span>
            </div>
            <div className="metric">
              <label>Error Rate:</label>
              <span>{(status.metrics.errorRate * 100).toFixed(1)}%</span>
            </div>
            <div className="metric">
              <label>Resource Efficiency:</label>
              <span>{(status.metrics.resourceEfficiency * 100).toFixed(1)}%</span>
            </div>
            <div className="metric">
              <label>Goal Progress:</label>
              <span>{(status.metrics.goalProgress * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="runs-section">
        <h3>Recent Runs</h3>
        <div className="runs-list">
          {status.recentRuns.length === 0 ? (
            <div className="no-runs">No runs yet</div>
          ) : (
            status.recentRuns.map((run) => (
              <div key={run.runId} className="run-item" data-cy={`run-${run.runId}`}>
                <div className="run-header">
                  <span className="run-id">{run.runId.substring(0, 8)}</span>
                  <span className={`run-status ${run.success ? 'success' : 'failed'}`}>
                    {run.success ? '✓' : '✗'}
                  </span>
                </div>
                <div className="run-details">
                  <span>Decisions: {run.decisions}</span>
                  <span>Actions: {run.actions}</span>
                  <span>Errors: {run.errors}</span>
                  <span>
                    Duration: {formatDuration((run.endTime || Date.now()) - run.startTime)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .ooda-monitor {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header h2 {
          margin: 0;
          color: #1f2937;
        }

        .toggle-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-button.start {
          background-color: #10b981;
          color: white;
        }

        .toggle-button.start:hover:not(:disabled) {
          background-color: #059669;
        }

        .toggle-button.stop {
          background-color: #ef4444;
          color: white;
        }

        .toggle-button.stop:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .toggle-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c00;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .status-section,
        .metrics-section,
        .runs-section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .status-section h3,
        .metrics-section h3,
        .runs-section h3 {
          margin: 0 0 15px 0;
          color: #374151;
          font-size: 18px;
        }

        .status-grid,
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .status-item,
        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .status-item label,
        .metric label {
          color: #6b7280;
          font-size: 14px;
        }

        .status-value.running {
          color: #10b981;
          font-weight: 500;
        }

        .status-value.stopped {
          color: #6b7280;
          font-weight: 500;
        }

        .phase-value {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 14px;
        }

        .runs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .run-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
        }

        .run-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .run-id {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #374151;
        }

        .run-status {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }

        .run-status.success {
          background-color: #10b981;
        }

        .run-status.failed {
          background-color: #ef4444;
        }

        .run-details {
          display: flex;
          gap: 20px;
          font-size: 14px;
          color: #6b7280;
        }

        .no-runs {
          text-align: center;
          color: #9ca3af;
          padding: 40px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};
