import { useMemo, useState } from 'react';
import { Folder, FileAudio, ChevronRight, ChevronDown, Activity } from 'lucide-react';
import type { AudioRecord } from '../App';

interface ExplorerViewProps {
  results: AudioRecord[];
  rootPath: string;
  onAnalyze: (record: AudioRecord) => void;
}

interface TreeNode {
  name: string;
  fullPath: string;
  children: Record<string, TreeNode>;
  files: AudioRecord[];
  stats: {
    total: number;
    real: number;
    inflated: number;
    suspicious: number;
    ok: number;
  };
}

export function ExplorerView({ results, rootPath, onAnalyze }: ExplorerViewProps) {
  const tree = useMemo(() => {
    // Determine the root folder name from the input path
    const rootFolderName = rootPath ? rootPath.split(/[/\\]/).filter(Boolean).pop() || 'Root' : 'Root';

    const root: TreeNode = {
      name: rootFolderName,
      fullPath: rootPath,
      children: {},
      files: [],
      stats: { total: 0, real: 0, inflated: 0, suspicious: 0, ok: 0 }
    };

    results.forEach(record => {
      // Strip out the root path to get relative folder structure
      let relativeFolder = record.folder;
      if (rootPath && record.folder.toLowerCase().includes(rootPath.toLowerCase())) {
        // Safe cross-platform slicing
        const idx = record.folder.toLowerCase().indexOf(rootPath.toLowerCase());
        relativeFolder = record.folder.slice(idx + rootPath.length);
      }
      
      const cleanRelative = relativeFolder.replace(/^[/\\]+/, '');
      const parts = cleanRelative ? cleanRelative.split(/[/\\]/).filter(Boolean) : [];
      
      let current = root;
      let currentPath = rootPath;
      
      // Always aggregate on root level
      current.stats.total++;
      if (record.status === 'REAL') current.stats.real++;
      if (record.status === 'INFLATED') current.stats.inflated++;
      if (record.status === 'SUSPICIOUS') current.stats.suspicious++;
      if (record.status === 'OK') current.stats.ok++;

      parts.forEach((part, index) => {
        currentPath += (index === 0 ? '/' : '') + part;
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            fullPath: currentPath,
            children: {},
            files: [],
            stats: { total: 0, real: 0, inflated: 0, suspicious: 0, ok: 0 }
          };
        }
        current = current.children[part];
        
        // Aggregate for child node
        current.stats.total++;
        if (record.status === 'REAL') current.stats.real++;
        if (record.status === 'INFLATED') current.stats.inflated++;
        if (record.status === 'SUSPICIOUS') current.stats.suspicious++;
        if (record.status === 'OK') current.stats.ok++;
      });
      
      // Add file to leaf folder
      current.files.push(record);
    });

    return root;
  }, [results, rootPath]);

  if (results.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No folders analyzed yet.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Library Explorer</h3>
      <div className="tree-container">
        <FolderNode node={tree} onAnalyze={onAnalyze} defaultOpen={true} />
      </div>
    </div>
  );
}

function FolderNode({ node, onAnalyze, defaultOpen = false }: { node: TreeNode, onAnalyze: (record: AudioRecord) => void, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { total, real, inflated, suspicious, ok } = node.stats;
  
  const realPct = total > 0 ? Math.round((real / total) * 100) : 0;
  const inflatedPct = total > 0 ? Math.round((inflated / total) * 100) : 0;
  const suspPct = total > 0 ? Math.round((suspicious / total) * 100) : 0;
  const okPct = total > 0 ? Math.round((ok / total) * 100) : 0;

  return (
    <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
      <div 
        className="folder-header hover-row" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem' }}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Folder size={18} color="#06b6d4" />
        <span style={{ fontWeight: 600, color: '#e5e5e5' }}>{node.name}</span>
        
        {/* Health Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', width: '250px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {total} files ({real} G, {suspicious} M, {ok} OK, {inflated} B)
          </span>
          <div style={{ display: 'flex', height: '6px', width: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
             {real > 0 && <div style={{ width: `${realPct}%`, background: 'var(--status-real)' }} />}
             {suspicious > 0 && <div style={{ width: `${suspPct}%`, background: 'var(--status-suspect)' }} />}
             {ok > 0 && <div style={{ width: `${okPct}%`, background: 'var(--status-ok)' }} />}
             {inflated > 0 && <div style={{ width: `${inflatedPct}%`, background: 'var(--status-inflated)' }} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '0.75rem', paddingLeft: '0.5rem' }}>
          {Object.values(node.children).map(child => (
            <FolderNode key={child.fullPath} node={child} onAnalyze={onAnalyze} />
          ))}
          
          {node.files.map((file, i) => (
            <div 
              key={i} 
              onClick={() => onAnalyze(file)}
              className="hover-row"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', marginLeft: '1.5rem', cursor: 'pointer', borderRadius: '4px' }}
              title="Click to view HD Spectrogram"
            >
              <FileAudio size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{file.filename}</span>
              <span style={{ 
                fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '2px', marginLeft: 'auto', fontWeight: 600,
                color: file.status === 'REAL' ? 'var(--status-real)' : file.status === 'INFLATED' ? 'var(--status-inflated)' : file.status === 'OK' ? 'var(--status-ok)' : 'var(--status-suspect)'
              }}>
                {file.status === 'REAL' ? 'Good' : file.status === 'INFLATED' ? 'Bad' : file.status === 'OK' ? 'OK' : 'Medium'}
              </span>
              <Activity size={14} color="var(--text-muted)" style={{ marginLeft: '4px', opacity: 0.5 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
