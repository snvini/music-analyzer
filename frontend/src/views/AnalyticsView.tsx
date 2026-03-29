import { useMemo } from 'react';
import type { AudioRecord } from '../App';

interface AnalyticsViewProps {
  results: AudioRecord[];
}

export function AnalyticsView({ results }: AnalyticsViewProps) {
  const stats = useMemo(() => {
    let real = 0;
    let inflated = 0;
    let suspicious = 0;
    let ok = 0;
    let totalSizeKbps = 0;

    const formatCounts: Record<string, number> = {};

    results.forEach(r => {
      if (r.status === 'REAL') real++;
      else if (r.status === 'INFLATED') inflated++;
      else if (r.status === 'SUSPICIOUS') suspicious++;
      else if (r.status === 'OK') ok++;

      formatCounts[r.codec] = (formatCounts[r.codec] || 0) + 1;
      
      if (!isNaN(parseInt(r.bitrate))) {
         totalSizeKbps += parseInt(r.bitrate);
      }
    });

    return { total: results.length, real, inflated, suspicious, ok, formatCounts, avgBitrate: results.length > 0 ? (totalSizeKbps / results.length) : 0 };
  }, [results]);



  if (results.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No analytics available. Run a scan first.
      </div>
    );
  }

  const realPct = stats.total > 0 ? Math.round((stats.real / stats.total) * 100) : 0;
  const inflatedPct = stats.total > 0 ? Math.round((stats.inflated / stats.total) * 100) : 0;
  const suspPct = stats.total > 0 ? Math.round((stats.suspicious / stats.total) * 100) : 0;
  const okPct = stats.total > 0 ? Math.round((stats.ok / stats.total) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      
      {/* Global Health Donut/Bar Equivalent */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Overall Quality Distribution</h3>
        
        <div style={{ display: 'flex', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
          {stats.real > 0 && <div style={{ width: `${realPct}%`, background: 'var(--status-real)', transition: 'width 1s ease' }} />}
          {stats.suspicious > 0 && <div style={{ width: `${suspPct}%`, background: 'var(--status-suspect)', transition: 'width 1s ease' }} />}
          {stats.ok > 0 && <div style={{ width: `${okPct}%`, background: 'var(--status-ok)', transition: 'width 1s ease' }} />}
          {stats.inflated > 0 && <div style={{ width: `${inflatedPct}%`, background: 'var(--status-inflated)', transition: 'width 1s ease' }} />}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
           <div style={{ color: 'var(--status-real)' }}>● Good: {stats.real} ({realPct}%)</div>
           <div style={{ color: 'var(--status-suspect)' }}>● Medium: {stats.suspicious} ({suspPct}%)</div>
           <div style={{ color: 'var(--status-ok)' }}>● OK: {stats.ok} ({okPct}%)</div>
           <div style={{ color: 'var(--status-inflated)' }}>● Bad: {stats.inflated} ({inflatedPct}%)</div>
        </div>
      </div>

      {/* Codec Breakdown */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Codec Distribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(stats.formatCounts).map(([codec, count]) => (
            <div key={codec}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                 <span>{codec}</span>
                 <span>{count} tracks</span>
               </div>
               <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                 <div style={{ height: '100%', width: `${(count / stats.total) * 100}%`, background: 'rgba(6, 182, 212, 0.5)', borderRadius: '2px' }} />
               </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
