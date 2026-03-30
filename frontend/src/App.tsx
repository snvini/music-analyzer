import { useState } from 'react';
import { Activity, FolderSearch, BarChart2, FileAudio, X, Search, ShieldAlert, Zap, Clock } from 'lucide-react';
import './index.css';
import { TableView } from './views/TableView';
import { ExplorerView } from './views/ExplorerView';
import { AnalyticsView } from './views/AnalyticsView';
import { FolderBrowser } from './views/FolderBrowser';
import { SystemCheck } from './views/SystemCheck';
import { useEffect } from 'react';

export interface AudioRecord {
  id: number;
  filename: string;
  folder: string;
  codec: string;
  sampleRate: string;
  bitrate: string;
  status: 'INFLATED' | 'REAL' | 'MEDIUM' | 'OK' | 'UNKNOWN';
  review: string;
  path: string;
  tags?: string[];
}

function App() {
  const [folderPath, setFolderPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusMsg, setStatusMsg] = useState('Ready');
  const [results, setResults] = useState<AudioRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'INFLATED' | 'OK' | 'MEDIUM' | 'REAL'>('ALL');
  const [scanMode, setScanMode] = useState<'full' | 'quick'>('full');
  const [activeTab, setActiveTab] = useState<'TABLE' | 'EXPLORER' | 'ANALYTICS'>('TABLE');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);
  const [spectrogramFile, setSpectrogramFile] = useState<AudioRecord | null>(null);
  const [isImgLoading, setIsImgLoading] = useState(true);

  // Trash Modal States
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [trashPaths, setTrashPaths] = useState<string[]>([]);
  const [dontShowTrashAgain, setDontShowTrashAgain] = useState(() => localStorage.getItem('hideTrashModal') === 'true');
  const [tempDontShowAgain, setTempDontShowAgain] = useState(false);

  // System Health States
  const [serverStatus, setServerStatus] = useState<'checking' | 'error' | 'ready'>('checking');
  const [ffmpegStatus, setFfmpegStatus] = useState(false);

  const checkHealth = async () => {
    setServerStatus('checking');
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      if (data.status === 'ok') {
         setFfmpegStatus(data.ffmpeg);
         setServerStatus('ready');
      } else {
         setServerStatus('error');
      }
    } catch (err) {
      console.error('Backend unreachable:', err);
      setServerStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const startScan = () => {
    if (!folderPath) return;
    
    setIsScanning(true);
    setResults([]);
    setProgress({ current: 0, total: 0 });
    setStatusMsg('Preparing scan...');

    setResults([]); // Clear results before starting a new scan
    setStatusMsg('Preparing scan...');

    const scanUrl = `http://localhost:3001/api/scan?path=${encodeURIComponent(folderPath)}${scanMode === 'quick' ? '&quick=true' : ''}`;
    const eventSource = new EventSource(scanUrl);

    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setStatusMsg(data.message);
      if (data.message === 'Done') {
        setIsScanning(false);
        eventSource.close();
      }
    });

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setProgress({ current: data.current, total: data.total });
      setStatusMsg(`Analyzing File ${data.current} of ${data.total}...`);
    });

    eventSource.addEventListener('result', (e) => {
      const record = JSON.parse((e as MessageEvent).data);
      setResults(prev => [...prev, record]);
    });

    eventSource.onerror = () => {
      setStatusMsg('Connection lost or scan interrupted.');
      setIsScanning(false);
      eventSource.close();
    };
  };

  const handleTrash = async (paths: string[]) => {
    try {
      const response = await fetch('http://localhost:3001/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePaths: paths })
      });
      await response.json();
      
      // Remove moved files from local results
      setResults(prev => prev.filter(r => !paths.includes(r.path)));
      setStatusMsg(`Moved ${paths.length} files to TRASH`);
    } catch (err) {
      console.error('Error trashing files:', err);
      setStatusMsg('Error moving files to TRASH');
    }
  };

  const triggerTrash = (paths: string[]) => {
    if (dontShowTrashAgain) {
      handleTrash(paths);
    } else {
      setTrashPaths(paths);
      setShowTrashModal(true);
    }
  };

  const confirmTrashFromModal = () => {
    if (tempDontShowAgain) {
      localStorage.setItem('hideTrashModal', 'true');
      setDontShowTrashAgain(true);
    }
    handleTrash(trashPaths);
    setTrashPaths([]);
    setShowTrashModal(false);
  };

  if (serverStatus !== 'ready' || !ffmpegStatus) {
    return <SystemCheck serverStatus={serverStatus} ffmpegStatus={ffmpegStatus} onRetry={checkHealth} />;
  }

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="logo-container">
          <div className="logo-icon">
            <Activity size={32} />
          </div>
          <div className="title">
            <h1>Music Analyzer</h1>
            <p>// AUDIO_QUALITY_VERIFICATION by DJ Viniish <span style={{ opacity: 0.35, marginLeft: '0.75rem' }}>v0.8.0</span></p>
          </div>
        </div>
        <div className="stats-badge">
          <BarChart2 size={16} /> [ {results.length} ] TRACKS_CAPTURED
        </div>
      </header>

      {/* Folder Browser Modal */}
      {showFolderBrowser && (
        <FolderBrowser 
          initialPath={folderPath} 
          onSelect={(path) => setFolderPath(path)} 
          onClose={() => setShowFolderBrowser(false)} 
        />
      )}

      {/* Control Panel */}
      <div className="glass-panel control-panel">
        <div className="input-group">
          <div className="input-wrapper">
            <label>
              <FolderSearch size={14} /> // TARGET_DIRECTORY_PATH
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="text" 
                className="path-input"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="E.g. C:\Music\Library..."
                disabled={isScanning}
              />
              <button 
                className="btn-secondary" 
                style={{ padding: '0 1.25rem', borderRadius: '4px', height: '48px', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowFolderBrowser(true)}
                disabled={isScanning}
                title="Browse folder"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
          <button 
            className={`btn-primary ${isScanning ? 'scanning' : ''}`}
            onClick={startScan}
            disabled={isScanning || !folderPath}
            style={{ height: '48px', minWidth: '240px' }}
          >
            {isScanning ? (
              <>
                <Activity size={18} className="animate-spin" /> SCANNING_CORE...
              </>
            ) : (
              <>
                <FileAudio size={18} /> INITIALIZE_ANALYSIS
              </>
            )}
          </button>
        </div>

        {/* Scan Mode Toggle */}
        <div className="scan-mode-toggle">
          <span className="scan-mode-label">// SCAN_DEPTH:</span>
          <div className="scan-mode-buttons">
            <button
              className={`scan-mode-btn ${scanMode === 'quick' ? 'active' : ''}`}
              onClick={() => setScanMode('quick')}
              disabled={isScanning}
              title="Analyzes 30 seconds from the middle of each track. Much faster for large libraries."
            >
              <Zap size={14} /> QUICK
            </button>
            <button
              className={`scan-mode-btn ${scanMode === 'full' ? 'active' : ''}`}
              onClick={() => setScanMode('full')}
              disabled={isScanning}
              title="Analyzes the entire track. More thorough but takes longer."
            >
              <Clock size={14} /> FULL
            </button>
          </div>
          <span className="scan-mode-hint">
            {scanMode === 'quick' 
              ? '⚡ 30s sample — faster scan' 
              : '🔬 Full track — more accurate, slower scan'}
          </span>
        </div>

        {/* Progress Bar */}
        {isScanning && (
          <div className="progress-container">
             <div className="progress-header">
               <span>{statusMsg}</span>
               <span className="font-mono text-xs">{progress.current} / {progress.total}</span>
             </div>
             <div className="progress-bar-bg">
               <div 
                  className="progress-bar-fill"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
               />
             </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <nav className="nav-tabs" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', gap: '1rem' }}>
          <button className={`btn-tab ${activeTab === 'TABLE' ? 'active' : ''}`} onClick={() => setActiveTab('TABLE')}>
             [01] DATA_TABLE
          </button>
          <button className={`btn-tab ${activeTab === 'EXPLORER' ? 'active' : ''}`} onClick={() => setActiveTab('EXPLORER')}>
             [02] FOLDER_TREE
          </button>
          <button className={`btn-tab ${activeTab === 'ANALYTICS' ? 'active' : ''}`} onClick={() => setActiveTab('ANALYTICS')}>
             [03] ANALYTICS
          </button>
        </nav>
      </div>

      {activeTab === 'TABLE' && (
        <div className="glass-panel table-container">
          <div className="filters">
            {(['ALL', 'REAL', 'MEDIUM', 'OK', 'INFLATED'] as const).map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`btn-filter ${filter === f ? 'active' : ''}`}
              >
                {f === 'ALL' ? 'All Tracks' : 
                 f === 'REAL' ? 'Good (320k+)' : 
                 f === 'MEDIUM' ? 'Medium (192k-256k)' : 
                 f === 'OK' ? 'OK (128k-191k)' :
                 'Bad (< 128k)'}
              </button>
            ))}
          </div>
          <TableView 
            results={results} 
            filter={filter} 
            expandedId={expandedId} 
            toggleExpand={toggleExpand} 
            onAnalyze={(r: AudioRecord) => { setIsImgLoading(true); setSpectrogramFile(r); }} 
            onTrash={triggerTrash}
          />
        </div>
      )}

      {activeTab === 'EXPLORER' && <ExplorerView results={results} rootPath={folderPath} onAnalyze={(r: AudioRecord) => { setIsImgLoading(true); setSpectrogramFile(r); }} />}
      {activeTab === 'ANALYTICS' && <AnalyticsView results={results} />}

      {spectrogramFile && (
        <div className="modal-overlay" onClick={() => setSpectrogramFile(null)}>
          <div className="modal-content modal-spectrogram" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSpectrogramFile(null)}>
              <X size={20} /> CLOSE_VIEW
            </button>
            
            <h3>// HD_SPECTROGRAM_ANALYSIS: {spectrogramFile.filename}</h3>
            
            <div className="spectrogram-container">
              {isImgLoading && (
                <div className="loader-spectrogram">
                  <Activity size={48} className="animate-spin" />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
                    GENERATING_VISUAL_DATA...
                  </span>
                </div>
              )}
              <img 
                src={`http://localhost:3001/api/spectrogram?path=${encodeURIComponent(spectrogramFile.path)}&t=${Date.now()}`} 
                alt="Spectrogram"
                className={`spectrogram-img ${!isImgLoading ? 'loaded' : ''}`}
                onLoad={() => setIsImgLoading(false)}
                onError={() => setIsImgLoading(false)}
              />
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setSpectrogramFile(null)}>
                TERMINATE_VIEW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Trash Warning Modal */}
      {showTrashModal && (
        <div className="modal-overlay" onClick={() => setShowTrashModal(false)}>
          <div className="modal-content trash-modal" onClick={e => e.stopPropagation()}>
            <ShieldAlert size={48} color="var(--status-inflated)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Move to Trash?</h2>
            <div className="trash-info-box">
              <p><strong>IMPORTANT:</strong> Music Analyzer <strong>NEVER</strong> deletes your files.</p>
              <p>The selected files will be moved to a <code>/trash</code> folder inside the project directory.</p>
              <p>You must manually empty that folder if you wish to permanently delete the files.</p>
            </div>
            
            <label className="dont-show-again">
              <input 
                type="checkbox" 
                checked={tempDontShowAgain}
                onChange={(e) => setTempDontShowAgain(e.target.checked)}
                className="custom-checkbox"
              />
              Don't show this message again
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowTrashModal(false)}>Cancel</button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={confirmTrashFromModal}>Move to TRASH</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
