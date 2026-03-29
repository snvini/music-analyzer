import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, ArrowUp, X, CheckCircle2, Home, Monitor, HardDrive, File, Send } from 'lucide-react';

interface FolderRoots {
  label: string;
  path: string;
  icon: string;
}

interface FolderBrowserProps {
  onSelect: (path: string) => void;
  onClose: () => void;
  initialPath?: string;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({ onSelect, onClose, initialPath }) => {
  const [currentPath, setCurrentPath] = useState(initialPath || '');
  const [parentPath, setParentPath] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [roots, setRoots] = useState<FolderRoots[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualPath, setManualPath] = useState('');

  const fetchFolders = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`http://localhost:3001/api/browse?path=${encodeURIComponent(path)}`);
      if (!resp.ok) throw new Error('Could not read directory');
      const data = await resp.json();
      setCurrentPath(data.currentPath);
      setManualPath(data.currentPath);
      setParentPath(data.parentPath);
      setFolders(data.folders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoots = async () => {
    try {
      const resp = await fetch(`http://localhost:3001/api/roots`);
      if (resp.ok) {
        const data = await resp.json();
        setRoots(data);
      }
    } catch (err) {
      console.error("Failed to fetch roots");
    }
  };

  useEffect(() => {
    fetchFolders(currentPath);
    fetchRoots();
  }, []);

  const handleNavigate = (folderName: string) => {
    const separator = currentPath.includes('\\') ? '\\' : '/';
    const newPath = currentPath.endsWith(separator) 
      ? `${currentPath}${folderName}` 
      : `${currentPath}${separator}${folderName}`;
    fetchFolders(newPath);
  };

  const handleGoUp = () => {
    if (parentPath && parentPath !== currentPath) {
      fetchFolders(parentPath);
    }
  };

  const getRootIcon = (iconName: string) => {
    switch(iconName) {
      case 'home': return <Home size={16} />;
      case 'monitor': return <Monitor size={16} />;
      case 'file': return <File size={16} />;
      case 'hard-drive': return <HardDrive size={16} />;
      default: return <Folder size={16} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ width: '700px', maxHeight: '90vh', minHeight: '500px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(6, 182, 212, 0.1)', padding: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'var(--accent-cyan)', margin: 0 }}>
             <Folder size={20} /> FS_NAVIGATOR_ROOT
           </h3>
           <button className="modal-close" onClick={onClose} style={{ position: 'static' }}><X size={20} /></button>
        </div>

        {/* Shortcuts Bar */}
        <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {roots.map(root => (
            <button 
              key={root.path} 
              className="btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => fetchFolders(root.path)}
            >
              {getRootIcon(root.icon)} {root.label}
            </button>
          ))}
        </div>

        {/* Manual Path Bar */}
        <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)' }}>
          <input 
            type="text" 
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
            className="search-input"
            placeholder="Paste folder path here..."
            style={{ margin: 0, padding: '0.5rem' }}
            onKeyDown={(e) => e.key === 'Enter' && fetchFolders(manualPath)}
          />
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '0 1rem' }} 
            onClick={() => fetchFolders(manualPath)}
            title="Go to Path"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Directory Explorer */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.25rem', display: 'flex', flexDirection: 'column' }}>
           {loading ? (
             <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
               <HardDrive className="animate-pulse" size={40} />
               <span>Accessing file system...</span>
             </div>
           ) : error ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--status-inflated)' }}>{error}</div>
           ) : (
             <>
                <button 
                  className="hover-row" 
                  onClick={handleGoUp}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', borderRadius: '4px', width: '100%' }}
                >
                   <ArrowUp size={18} color="var(--accent-cyan)" />
                   <span style={{ fontWeight: 600 }}>.. (Navigate Up)</span>
                </button>
                {folders.length === 0 && !loading && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subfolders found.</div>
                )}
                {folders.map(folder => (
                   <div 
                    key={folder}
                    className="hover-row" 
                    onClick={() => handleNavigate(folder)}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.8rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', borderRadius: '4px', width: '100%', marginBottom: '2px' }}
                  >
                     <Folder size={18} color="var(--text-muted)" />
                     <span style={{ flex: 1, fontSize: '0.9rem' }}>{folder}</span>
                     <ChevronRight size={14} style={{ opacity: 0.3 }} />
                  </div>
                ))}
             </>
           )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(6, 182, 212, 0.1)', padding: '1.25rem' }}>
           <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>CANCEL</button>
           <button 
             className="btn-primary" 
             style={{ flex: 1.5 }} 
             onClick={() => { onSelect(currentPath); onClose(); }}
             disabled={loading}
           >
             <CheckCircle2 size={18} /> CONFIRM_DIR_SELECTION
           </button>
        </div>
      </div>
    </div>
  );
};
