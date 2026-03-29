import React from 'react';
import { AlertTriangle, Download, RefreshCcw, Terminal } from 'lucide-react';

interface SystemCheckProps {
  serverStatus: 'checking' | 'error' | 'ready';
  ffmpegStatus: boolean;
  onRetry: () => void;
}

export const SystemCheck: React.FC<SystemCheckProps> = ({ serverStatus, ffmpegStatus, onRetry }) => {
  const isServerDown = serverStatus === 'error';
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(window.navigator.platform);

  if (serverStatus === 'checking') {
    return (
      <div className="container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <RefreshCcw className="animate-spin" size={48} color="var(--accent-cyan)" style={{ marginBottom: '1.5rem' }} />
          <h2>Starting System...</h2>
          <p className="text-muted">Verifying requirements and analysis engine.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', border: '1px solid var(--status-inflated)' }}>
        <AlertTriangle size={64} color="var(--status-inflated)" style={{ marginBottom: '1.5rem' }} />
        
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          {isServerDown ? 'Backend Unavailable' : (!ffmpegStatus ? 'FFmpeg not Detected' : 'Requirement Missing')}
        </h2>
        
        <p style={{ marginBottom: '2rem', color: '#fca5a5' }}>
          {isServerDown 
            ? `The analysis engine (Backend) is not responding. Please ensure you started the system via ${isMac ? './launch_mac.sh' : 'launch_windows.bat'}.` 
            : 'The analysis engine is running, but FFmpeg was not found on your system. It is essential for analyzing music frequencies.'}
        </p>

        <div className="trash-info-box" style={{ textAlign: 'left', background: 'rgba(0,0,0,0.4)', borderLeftColor: 'var(--accent-cyan)' }}>
          <p style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={16} /> How to fix:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#d4d4d4' }}>
            {isServerDown ? (
              <>
                <li>{isMac ? 'Close the Terminal app.' : 'Close all black terminal windows.'}</li>
                <li>Run <code>{isMac ? './setup_mac.sh' : 'setup_windows.bat'}</code> to ensure everything is installed.</li>
                <li>Use <code>{isMac ? './launch_mac.sh' : 'launch_windows.bat'}</code> to start again.</li>
              </>
            ) : (
              <>
                <li>Open a terminal ({isMac ? 'Terminal.app' : 'PowerShell or CMD'}).</li>
                <li>Paste {isMac ? 'this brew' : 'children'} command: <code>{isMac ? 'brew install ffmpeg' : 'winget install Gyan.FFmpeg'}</code></li>
                <li>Or download manually at <a href="https://ffmpeg.org/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>ffmpeg.org</a>.</li>
                <li>After installation, <b>restart the terminal</b> and the system.</li>
              </>
            )}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={onRetry}>
            <RefreshCcw size={18} /> Try Again
          </button>
          {!isServerDown && (
            <button className="btn-secondary" onClick={() => window.open('https://github.com/GyanD/codexffmpeg/releases', '_blank')}>
              <Download size={18} /> Download FFmpeg
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
