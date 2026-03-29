import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, ArrowUp, X, CheckCircle2 } from 'lucide-react';

interface FolderBrowserProps {
  onSelect: (path: string) => void;
  onClose: () => void;
  initialPath?: string;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({ onSelect, onClose, initialPath }) => {
  const [currentPath, setCurrentPath] = useState(initialPath || '');
  const [parentPath, setParentPath] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`http://localhost:3001/api/browse?path=${encodeURIComponent(path)}`);
      if (!resp.ok) throw new Error('Could not read directory');
      const data = await resp.json();
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath);
      setFolders(data.folders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders(currentPath);
  }, []);

  const handleNavigate = (folderName: string) => {
    // Determine the separator based on the current path style
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ width: '600px', maxHeight: '85vh', minHeight: '400px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(6, 182, 212, 0.1)', padding: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
             <Folder size={18} /> // FS_NAVIGATOR_ROOT
           </h3>
           <button className="modal-close" onClick={onClose} style={{ position: 'static' }}><X size={20} /></button>
        </div>

        <div className="trash-info-box" style={{ background: 'rgba(0,0,0,0.3)', borderLeftColor: 'var(--accent-cyan)', color: '#fff', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
           <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{currentPath}</code>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
           {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading folders...</div>
           ) : error ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--status-inflated)' }}>{error}</div>
           ) : (
             <>
                <button 
                  className="hover-row" 
                  onClick={handleGoUp}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', borderRadius: '4px', width: '100%' }}
                >
                   <ArrowUp size={16} color="var(--text-muted)" />
                   <span>.. (Parent Directory)</span>
                </button>
                {folders.map(folder => (
                  <button 
                    key={folder}
                    className="hover-row" 
                    onClick={() => handleNavigate(folder)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', borderRadius: '4px', width: '100%' }}
                  >
                     <Folder size={16} color="var(--text-muted)" />
                     <span style={{ flex: 1 }}>{folder}</span>
                     <ChevronRight size={14} className="opacity-30" />
                  </button>
                ))}
             </>
           )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(6, 182, 212, 0.1)', padding: '1.25rem' }}>
           <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>CANCEL_OP</button>
           <button 
             className="btn-primary" 
             style={{ flex: 1.5 }} 
             onClick={() => { onSelect(currentPath); onClose(); }}
           >
             <CheckCircle2 size={18} /> CONFIRM_SELECTION
           </button>
        </div>
      </div>
    </div>
  );
};
