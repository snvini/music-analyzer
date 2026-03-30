import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import type { AudioRecord } from '../App';

interface TableViewProps {
  results: AudioRecord[];
  filter: 'ALL' | 'INFLATED' | 'OK' | 'SUSPICIOUS' | 'REAL';
  expandedId: number | null;
  toggleExpand: (id: number) => void;
  onAnalyze: (record: AudioRecord) => void;
  onTrash: (paths: string[]) => void;
}

export function TableView({ results, filter, expandedId, toggleExpand, onAnalyze, onTrash }: TableViewProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof AudioRecord; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Basic column widths state
  const [colWidths, setColWidths] = useState({
    select: 40, status: 100, filename: 250, folder: 300, codec: 80, sampleRate: 100, bitrate: 120, expand: 36
  });

  const handleDrag = (e: React.MouseEvent, col: keyof typeof colWidths) => {
    const startX = e.clientX;
    const startWidth = colWidths[col];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      setColWidths(prev => ({ ...prev, [col]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleSort = (key: keyof AudioRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filtered = results.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key] ?? '';
    const bVal = b[sortConfig.key] ?? '';

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sorted.length && sorted.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map(r => r.id)));
    }
  };

  const handleTrashClick = () => {
    const pathsToMove = results.filter(r => selectedIds.has(r.id)).map(r => r.path);
    onTrash(pathsToMove);
    setSelectedIds(new Set());
  };

  const getStatusBadge = (status: AudioRecord['status']) => {
    switch(status) {
      case 'REAL': return <div className="status-badge status-real">GOOD</div>;
      case 'SUSPICIOUS': return <div className="status-badge status-suspect">MEDIUM</div>;
      case 'OK': return <div className="status-badge status-ok">OK</div>;
      case 'INFLATED': return <div className="status-badge status-inflated">BAD</div>;
    }
  };

  return (
    <div className="glass-panel table-container px-0" style={{ position: 'relative' }}>
      {/* Table Sub-Header for Bulk Actions */}
      <div className="table-bulk-header">
         <span>{selectedIds.size} files selected</span>
         {selectedIds.size > 0 && (
           <button className="btn-trash-header" onClick={handleTrashClick}>
             <ShieldAlert size={14} /> MOVE_TO_TRASH
           </button>
         )}
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ tableLayout: 'fixed', width: '100%', minWidth: '1000px' }}>
        <thead>
          <tr>
            <th style={{ width: colWidths.select }}>
              <input 
                type="checkbox" 
                checked={selectedIds.size === sorted.length && sorted.length > 0} 
                onChange={toggleSelectAll}
                className="custom-checkbox"
              />
            </th>
            {(['status', 'filename', 'folder', 'codec', 'sampleRate', 'bitrate'] as const).map((col) => (
              <th 
                key={col} 
                style={{ width: colWidths[col], position: 'relative' }}
              >
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleSort(col as keyof AudioRecord)}>
                  <span style={{ fontSize: '0.7rem' }}>
                    // {col === 'sampleRate' ? 'SAMPLE_RATE' : col.toUpperCase()}
                  </span>
                </div>
                {/* Resizer Handle */}
                <div 
                  className="resizer"
                  onMouseDown={(e) => handleDrag(e, col)}
                  style={{
                    position: 'absolute', right: -5, top: 0, bottom: 0, width: '10px',
                    cursor: 'col-resize', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '2px', height: '50%', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '1px' }} />
                </div>
              </th>
            ))}
            {/* Expand chevron column - no header text */}
            <th style={{ width: colWidths.expand }} />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No results to display
              </td>
            </tr>
          ) : sorted.map((r) => (
            <React.Fragment key={r.id}>
              <tr onClick={() => toggleExpand(r.id)} style={{ cursor: 'pointer' }} className={`hover-row ${selectedIds.has(r.id) ? 'selected-row' : ''}`}>
                <td style={{ width: colWidths.select }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(r.id)} 
                    onChange={(e) => { e.stopPropagation(); toggleSelect(r.id, e as any); }}
                    onClick={(e) => e.stopPropagation()}
                    className="custom-checkbox"
                  />
                </td>
                <td style={{ width: colWidths.status, overflow: 'hidden' }}>
                   {getStatusBadge(r.status)}
                </td>
                <td style={{ width: colWidths.filename, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.filename}>
                  {r.filename}
                </td>
                <td style={{ width: colWidths.folder, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="text-muted text-xs font-mono" title={r.folder}>
                  {r.folder}
                </td>
                <td style={{ width: colWidths.codec, overflow: 'hidden' }}>
                  <span className="codec-badge">{r.codec}</span>
                </td>
                <td style={{ width: colWidths.sampleRate, overflow: 'hidden' }} className="text-muted tabular-nums">
                  {r.sampleRate || '?'}
                </td>
                <td style={{ width: colWidths.bitrate, overflow: 'hidden' }} className="text-muted font-mono">
                  <span>{r.bitrate}</span>
                </td>
                <td style={{ width: colWidths.expand, textAlign: 'center', verticalAlign: 'middle' }}>
                  {expandedId === r.id ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </td>
              </tr>
              
              {/* Expandable Details Row */}
              {expandedId === r.id && (
                <tr className="details-row" onClick={(e) => e.stopPropagation()}>
                  <td colSpan={8}>
                    <div className="details-overflow-fix">
                      <div className="report-container">
                        <div className="report-header">
                           <Activity size={12} className="text-cyan animate-pulse" />
                           <span className="report-title">HUD_RECOGNITION_REPORT: {r.filename}</span>
                        </div>
                        
                        <div className="report-grid">
                          <div className="report-section">
                            <span className="section-label">[ ANALYSIS_TAGS ]</span>
                            <div className="tags-list">
                              {r.tags && r.tags.length > 0 ? r.tags.map((t, idx) => (
                                <span key={idx} className="tag-pill">{t}</span>
                              )) : (
                                <span className="text-muted">NO_TAGS_DETECTED</span>
                              )}
                            </div>
                          </div>
 
                          <div className="report-section" style={{ flex: 2 }}>
                            <span className="section-label">[ QUALITY_SUMMARY ]</span>
                            <div className="report-text">
                              {r.review || "NO_METRICS_AVAILABLE_FOR_THIS_STREAM"}
                            </div>
                          </div>
 
                          <div className="report-section action-section">
                            <span className="section-label">[ DIAGNOSTICS ]</span>
                            <button 
                              className="btn-primary report-btn"
                              onClick={(e) => { e.stopPropagation(); onAnalyze(r); }}
                            >
                              <Activity size={14} /> VIEW_HD_SPECTROGRAM
                            </button>
                          </div>
                        </div>
                        
                        <div className="report-footer">
                          REC_ID: {r.id} // SECURE_BLOCK_0x{r.id.toString(16).toUpperCase()} // END_REPORT
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
