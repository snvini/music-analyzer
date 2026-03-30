const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE_PATH = process.env.FFPROBE_PATH || 'ffprobe';

/**
 * Extracts metadata from audio file using ffprobe.
 */
function getMetadata(filePath) {
  return new Promise((resolve) => {
    const args = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath];
    const proc = spawn(FFPROBE_PATH, args);
    let output = '';
    proc.stdout.on('data', (data) => output += data.toString());
    proc.on('close', () => {
      try {
        const data = JSON.parse(output);
        const format = data.format || {};
        const stream = (data.streams || []).find(s => s.codec_type === 'audio') || {};
        resolve({
          filename: path.basename(filePath),
          folder: path.dirname(filePath),
          codec: stream.codec_name || 'unknown',
          sampleRate: stream.sample_rate ? `${(stream.sample_rate / 1000).toFixed(1)}kHz` : 'unknown',
          bitrate: format.bit_rate ? Math.round(format.bit_rate / 1000) : 0,
          bitrateStr: format.bit_rate ? `${Math.round(format.bit_rate / 1000)}kbps` : 'unknown',
          path: filePath
        });
      } catch (e) {
        resolve({ filename: path.basename(filePath), folder: path.dirname(filePath), bitrate: 0, bitrateStr: 'error', path: filePath });
      }
    });
  });
}

/**
 * Generates a high-quality spectrogram using ffmpeg.
 */
function generateSpectrogram(filePath, outPath) {
    return new Promise((resolve, reject) => {
        const args = ['-i', filePath, '-lavfi', 'showspectrumpic=s=1024x512:mode=combined:color=magma:scale=log:fscale=lin:legend=1', '-y', outPath];
        const proc = spawn(FFMPEG_PATH, args);
        proc.on('close', (code) => code === 0 ? resolve() : reject(new Error('FFmpeg failed')));
        proc.on('error', reject);
    });
}

/**
 * Performs a 10-band spectral analysis to detect volume levels and peaks.
 */
function analyzeQuality(filePath, quickScan = false) {
    return new Promise((resolve) => {
        const filterComplex = [
            '[0:a]asplit=10[f1][f2][f3][f4][f5][f6][f7][f8][f9][f10]',
            '[f1]volumedetect[full]',
            '[f2]highpass=f=4000,volumedetect[b4k]',
            '[f3]highpass=f=8000,volumedetect[b8k]',
            '[f4]highpass=f=10000,volumedetect[b10k]',
            '[f5]highpass=f=12000,volumedetect[b12k]',
            '[f6]highpass=f=14000,volumedetect[b14k]',
            '[f7]highpass=f=16000,volumedetect[b16k]',
            '[f8]highpass=f=18000,volumedetect[b18k]',
            '[f9]highpass=f=20000,volumedetect[b20k]',
            '[f10]highpass=f=22000,volumedetect[b22k]',
        ].join(';');
        const args = [];
        if (quickScan) args.push('-ss', '30', '-t', '30');
        args.push('-i', filePath, '-filter_complex', filterComplex, 
            '-map', '[full]', '-f', 'null', '-',
            '-map', '[b4k]', '-f', 'null', '-',
            '-map', '[b8k]', '-f', 'null', '-',
            '-map', '[b10k]', '-f', 'null', '-',
            '-map', '[b12k]', '-f', 'null', '-',
            '-map', '[b14k]', '-f', 'null', '-',
            '-map', '[b16k]', '-f', 'null', '-',
            '-map', '[b18k]', '-f', 'null', '-',
            '-map', '[b20k]', '-f', 'null', '-',
            '-map', '[b22k]', '-f', 'null', '-'
        );
        const proc = spawn(FFMPEG_PATH, args);
        let output = '';
        proc.stderr.on('data', (data) => output += data.toString());
        proc.on('close', () => {
            const maxMatches = [...output.matchAll(/\[Parsed_volumedetect_(\d+) @ .*?\] max_volume:\s*([\-\d\.]+)\s*dB/g)];
            const meanMatches = [...output.matchAll(/\[Parsed_volumedetect_(\d+) @ .*?\] mean_volume:\s*([\-\d\.]+)\s*dB/g)];
            const results = {};
            meanMatches.forEach(m => { const id = parseInt(m[1]); if (!results[id]) results[id] = {}; results[id].mean = parseFloat(m[2]); });
            maxMatches.forEach(m => { const id = parseInt(m[1]); if (!results[id]) results[id] = {}; results[id].max = parseFloat(m[2]); });
            const sortedKeys = Object.keys(results).sort((a, b) => parseInt(a) - parseInt(b));
            const finalData = sortedKeys.map(k => results[k]);
            resolve({ 
                full: finalData[0] || null, 
                b4k: finalData[1] || null, 
                b8k: finalData[2] || null, 
                b10k: finalData[3] || null, 
                b12k: finalData[4] || null,
                b14k: finalData[5] || null, 
                b16k: finalData[6] || null, 
                b18k: finalData[7] || null, 
                b20k: finalData[8] || null,
                b22k: finalData[9] || null 
            });
        });
        proc.on('error', () => resolve(null));
    });
}

/**
 * Classifies audio quality based on spectral data, using 'Evolutionary Logic'
 * which finds the absolute highest valid frequency band.
 */
function classifyBySpectralCurve(bands, metadata) {
    if (!bands || !bands.full) return { status: 'UNKNOWN', tags: [], review: 'Error.' };
    const fullMean = bands.full.mean;
    const bandList = [
        { freq: '4kHz', data: bands.b4k }, { freq: '8kHz', data: bands.b8k }, { freq: '10kHz', data: bands.b10k }, 
        { freq: '12kHz', data: bands.b12k }, { freq: '14kHz', data: bands.b14k }, { freq: '16kHz', data: bands.b16k }, 
        { freq: '18kHz', data: bands.b18k }, { freq: '20kHz', data: bands.b20k }, { freq: '22kHz', data: bands.b22k }
    ];
    
    let highestValidIdx = -1;
    let shelfDetected = false;
    let firstDeadIdx = -1;

    for (let i = 0; i < bandList.length; i++) {
        const b = bandList[i];
        if (!b.data || b.data.mean === undefined) continue;
        
        const drop = fullMean - b.data.mean;
        const dynamicGap = b.data.max - b.data.mean;
        const isSpiky = dynamicGap > 35; // Increased to allow rhythmic percussion (hats)
        const effectiveDrop = isSpiky ? drop + 8 : drop; // Reduced penalty

        // SINCERE TREBLE RULE: High energy peaks are music, mid-energy peaks check for noise.
        const maxDrop = bands.full.max - b.data.max;
        const isNotSilent = effectiveDrop < 32; // More generous for sparse arrangements
        
        const isSincerePeak = maxDrop < 15; // In-drop music is very loud
        const isLikelyMusic = maxDrop < 20 && !isSpiky; // Mid-peaks need to be clean

        if (isNotSilent || isSincerePeak || isLikelyMusic) {
            highestValidIdx = i;
            if (firstDeadIdx !== -1) shelfDetected = true;
        } else if (firstDeadIdx === -1) {
            firstDeadIdx = i;
        }
    }

    // Determine the reporting cutoff: The frequency band AFTER the highest valid one.
    let reportingCutoff = null;
    if (highestValidIdx === -1) {
        reportingCutoff = '4kHz';
    } else if (highestValidIdx < bandList.length - 1) {
        reportingCutoff = bandList[highestValidIdx + 1].freq;
    }

    const { codec, bitrate } = metadata;
    const isLossless = codec && (codec.toUpperCase().includes('FLAC') || codec.toUpperCase().includes('PCM') || codec.toUpperCase().includes('WAV'));
    let status, tags = [], review;

    if (!reportingCutoff) {
        status = 'REAL';
        tags = [isLossless ? 'Studio Grade' : 'Pristine Audio', 'Full Spectrum'];
        review = `Top tier spectrum verified. Clean all the way to 22kHz.`;
    } else {
        const reportedKbps = parseInt(bitrate);
        switch (reportingCutoff) {
            case '22kHz':
                status = 'REAL';
                tags.push('High Fidelity');
                review = `Near-lossless spectral performance. High-end sparkle confirmed.`;
                break;
            case '20kHz':
                status = 'MEDIUM';
                if (reportedKbps >= 320) tags.push('True 320kbps', 'High Quality');
                else tags.push('Standard High', '256kbps');
                if (isLossless && !shelfDetected) tags.unshift('FAKE LOSSLESS');
                review = `Consistent 320kbps quality verified. Professional grade.`;
                break;
            case '18kHz':
                status = 'MEDIUM';
                tags.push('Standard 256k');
                if (reportedKbps >= 320) tags.push('FAKE 320kbps');
                if (isLossless && !shelfDetected) tags.unshift('FAKE LOSSLESS');
                review = `Spectral body ends at 18kHz. Very good for club play.`;
                break;
            case '16kHz':
            case '14kHz':
                status = 'OK';
                tags.push(reportingCutoff === '16kHz' ? 'Standard 192k' : 'Standard 128k');
                if (reportedKbps >= 256) tags.push('FAKE / UPSCALED');
                if (isLossless && !shelfDetected) tags.unshift('FAKE LOSSLESS');
                review = `Capped at ${reportingCutoff}. Standard library quality. Not recommended for main sets.`;
                break;
            default:
                status = 'INFLATED';
                tags.push('Poor Quality');
                if (reportedKbps >= 128) tags.unshift('FRAUD DETECTED');
                review = `Spectral body dies prematurely at ${reportingCutoff}. Severe information loss detected.`;
        }
        if (shelfDetected && status !== 'REAL') {
             tags.push('Mixed Quality');
             review += " Note: Spectral recovery (Shelf) detected above the main roll-off.";
        }
    }
    return { status, tags, review };
}

module.exports = {
    getMetadata,
    generateSpectrogram,
    analyzeQuality,
    classifyBySpectralCurve
};
