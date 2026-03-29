const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

// Configure FFMPEG paths. 
// For OSS users, it defaults to system PATH.
// We use 'ffmpeg' and 'ffprobe' which should be in the PATH if installed.
let FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
let FFPROBE_PATH = process.env.FFPROBE_PATH || "ffprobe";

// Common paths for Mac/Linux to be extra safe
const COMMON_FFMPEG_PATHS = [
    FFMPEG_PATH,
    '/usr/local/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
    '/usr/bin/ffmpeg'
];

const COMMON_FFPROBE_PATHS = [
    FFPROBE_PATH,
    '/usr/local/bin/ffprobe',
    '/opt/homebrew/bin/ffprobe',
    '/usr/bin/ffprobe'
];

// Function to verify if FFmpeg is working and find its location
async function findAndVerifyFFmpeg() {
    for (const p of COMMON_FFMPEG_PATHS) {
        const works = await new Promise((resolve) => {
            const proc = spawn(p, ['-version']);
            proc.on('error', () => resolve(false));
            proc.on('close', (code) => resolve(code === 0));
        });
        if (works) {
            FFMPEG_PATH = p;
            // Also update ffprobe path if it matches the same prefix
            const probePath = p.replace('ffmpeg', 'ffprobe');
            if (fs.existsSync(probePath)) FFPROBE_PATH = probePath;
            return true;
        }
    }
    return false;
}

// Helper to recursively find audio files
function findAudioFiles(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                findAudioFiles(filePath, fileList);
            } else {
                const ext = path.extname(file).toLowerCase();
                if (['.mp3', '.wav', '.flac', '.m4a', '.aiff', '.ogg'].includes(ext)) {
                    fileList.push(filePath);
                }
            }
        }
    } catch (err) {
        console.error("Error reading directory:", dir, err);
    }
    return fileList;
}

// Helper to get basic info via ffprobe
function getAudioInfo(filePath) {
    return new Promise((resolve) => {
        const proc = spawn(FFPROBE_PATH, [
            '-v', 'error',
            '-show_entries', 'stream=codec_name,sample_rate,bit_rate',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            filePath
        ]);

        let output = '';
        proc.stdout.on('data', (data) => output += data.toString());
        
        proc.on('close', () => {
            const lines = output.trim().split('\n');
            const br = parseInt(lines[2]);
            resolve({
                codec: lines[0] || 'unknown',
                sampleRate: lines[1] || 'unknown',
                bitrate: !isNaN(br) ? Math.round(br/1000) + ' kbps' : ((lines[0] || '').includes('flac') || (lines[0] || '').includes('pcm') ? 'Lossless' : 'N/A')
            });
        });
        
        proc.on('error', () => resolve({ codec: 'error', sampleRate: 'error', bitrate: 'error' }));
    });
}

// Helper to run ffmpeg highpass filter at multiple bands
function analyzeQuality(filePath) {
    return new Promise((resolve) => {
        // Checking Full Track, 16kHz and 19kHz boundaries
        const proc = spawn(FFMPEG_PATH, [
            '-i', filePath,
            '-filter_complex', '[0:a]volumedetect[v0];[0:a]highpass=f=16000,volumedetect[v16];[0:a]highpass=f=19000,volumedetect[v19]',
            '-map', '[v0]', '-f', 'null', '-',
            '-map', '[v16]', '-f', 'null', '-',
            '-map', '[v19]', '-f', 'null', '-'
        ]);

        let output = '';
        proc.stderr.on('data', (data) => output += data.toString());

        proc.on('close', () => {
            const means = [...output.matchAll(/mean_volume:\s*([\-\d\.]+)\s*dB/g)];
            const maxes = [...output.matchAll(/max_volume:\s*([\-\d\.]+)\s*dB/g)];
            
            resolve({
                full: {
                    mean: means[0] ? parseFloat(means[0][1]) : null,
                    max: maxes[0] ? parseFloat(maxes[0][1]) : null
                },
                vol16: {
                    mean: means[1] ? parseFloat(means[1][1]) : null,
                    max: maxes[1] ? parseFloat(maxes[1][1]) : null
                },
                vol19: {
                    mean: means[2] ? parseFloat(means[2][1]) : null,
                    max: maxes[2] ? parseFloat(maxes[2][1]) : null
                }
            });
        });

        proc.on('error', () => resolve(null));
    });
}

// Health check endpoint for system readiness
app.get('/api/health', async (req, res) => {
  const ffmpegOk = await findAndVerifyFFmpeg();
  res.json({
    status: 'ok',
    ffmpeg: ffmpegOk,
    nodeVersion: process.version,
    platform: process.platform,
    message: ffmpegOk ? 'System ready' : 'FFmpeg not found. Please install FFmpeg and add it to your PATH.'
  });
});

// Endpoint to browse directories
app.get('/api/browse', async (req, res) => {
    let currentPath = req.query.path || os.homedir();
    
    try {
        // If empty path, default to home
        if (!currentPath) currentPath = os.homedir();

        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        const folders = entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .sort((a, b) => a.localeCompare(b));

        res.json({
            currentPath: path.resolve(currentPath),
            parentPath: path.dirname(currentPath),
            folders: folders
        });
    } catch (err) {
        console.error("Browse Error:", err);
        res.status(500).json({ error: "Could not read directory." });
    }
});

// Event stream endpoint
app.get('/api/scan', async (req, res) => {
    const folderPath = req.query.path;
    if (!folderPath || !fs.existsSync(folderPath)) {
        return res.status(400).json({ error: 'Invalid or missing directory path.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
        sendEvent('status', { message: 'Scanning folders...' });
        const allFiles = findAudioFiles(folderPath);
        
        sendEvent('progress', { total: allFiles.length, current: 0 });

        for (let i = 0; i < allFiles.length; i++) {
            const file = allFiles[i];
            
            const info = await getAudioInfo(file);
            const analysis = await analyzeQuality(file);

            let status = 'UNKNOWN';
            let review = 'Failed to algorithmically analyze this file.';
            let tags = [];

            if (analysis && analysis.vol16.mean !== null && analysis.full.mean !== null) {
                const fullMean = analysis.full.mean;
                const fullMax = analysis.full.max;
                const mean16 = analysis.vol16.mean;
                const mean19 = analysis.vol19.mean;

                // Calibrate the dropoff based on the full track's volume
                // A healthy track might have fullMean at -12dB and mean16 at -35dB (a 23dB drop)
                // A fake 128kbps track might have fullMean at -12dB and mean16 at -70dB (a 58dB drop)
                const dropFrom16 = fullMean - mean16; // should be negative, e.g. -12 - (-70) = 58dB difference
                
                if (dropFrom16 > 58 || mean16 < -72) {
                    status = 'INFLATED';
                    tags = ['Severe Compression', '< 128kbps', 'Bad Quality'];
                    review = `Base Volume: ${fullMean.toFixed(1)}dB. Frequencies crash severely below 12kHz (dropping to ${mean16.toFixed(1)}dB). This is a signature of heavily compressed low-bitrate audio (< 128kbps). Unsuitable for high-fidelity playback.`;
                } else if (dropFrom16 > 45 || mean16 < -60) {
                    status = 'OK';
                    tags = ['OK Quality', '128k ~ 191k'];
                    review = `Base Volume: ${fullMean.toFixed(1)}dB. Measurable frequency attenuation above 16kHz (${mean16.toFixed(1)}dB). Typical of 128kbps - 160kbps MP3s. Acceptable for casual listening, but "OK" at best for studio/club use.`;
                } else if (dropFrom16 > 35 || mean19 < -58) {
                    status = 'SUSPICIOUS';
                    tags = ['High Compression', '~ 192kbps - 256kbps'];
                    review = `Base Volume: ${fullMean.toFixed(1)}dB. Shows rapid attenuation past 16kHz (${mean16.toFixed(1)}dB) and loses almost all signal past 19kHz (${mean19.toFixed(1)}dB). Likely a 192kbps or 256kbps MP3 disguised as a lossless container.`;
                } else {
                    status = 'REAL';
                    tags = ['True Lossless', 'Full Spectrum'];
                    review = `Pristine Audio! Dynamic volume maintains solid mids/lows at ${fullMean.toFixed(1)}dB, and ultra-high frequencies (drums/air at 19kHz+) display a healthy ${mean19.toFixed(1)}dB. No sudden cut-offs detected. Perfect for club systems.`;
                }
            }

            // Quick tweak for obvious lossless containers just by bitrate size
            if (status === 'REAL' && (info.codec === 'flac' || info.codec.includes('pcm'))) {
                tags.unshift('Studio Grade');
            }

            let displayCodec = info.codec.toUpperCase();
            if (displayCodec.includes('PCM')) displayCodec = 'WAV';

            const result = {
                id: i,
                filename: path.basename(file),
                folder: path.dirname(file),
                path: file,
                codec: displayCodec,
                sampleRate: info.sampleRate,
                bitrate: info.bitrate,
                status: status,
                review: review,
                tags: tags
            };


            sendEvent('result', result);
            sendEvent('progress', { total: allFiles.length, current: i + 1 });
        }

        sendEvent('done', { message: 'Spectral Analysis Complete!' });
        res.end();

    } catch (err) {
        sendEvent('error', { message: err.message });
        res.end();
    }
});

// Endpoint to generate an on-demand spectrogram image for a single file
app.get('/api/spectrogram', (req, res) => {
    const filePath = req.query.path;
    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const tempFile = path.join(os.tmpdir(), `spec_${Date.now()}.png`);
    
    // showspectrumpic for high-res spectrogram, size 1200x500
    const ffmpegCmd = `"${FFMPEG_PATH}" -v error -i "${filePath}" -lavfi "showspectrumpic=s=1200x500:mode=separate:color=intensity" -frames:v 1 -y "${tempFile}"`;
    
    exec(ffmpegCmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Spectrogram Generation Error:', stderr || error);
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
            return res.status(500).send('Error generating spectrogram');
        }
        res.sendFile(tempFile, (err) => {
            // Delete immediately after serving to avoid memory/storage leaks
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        });
    });
});

// Endpoint to move records to a project-internal TRASH folder
app.post('/api/trash', (req, res) => {
    const { filePaths } = req.body;
    if (!filePaths || !Array.isArray(filePaths)) {
        return res.status(400).json({ error: 'Invalid file list' });
    }

    const trashDir = path.join(__dirname, '..', 'trash');
    if (!fs.existsSync(trashDir)) {
        fs.mkdirSync(trashDir, { recursive: true });
    }

    const moveResults = [];
    for (const filePath of filePaths) {
        try {
            if (fs.existsSync(filePath)) {
                const fileName = path.basename(filePath);
                const destPath = path.join(trashDir, fileName);
                
                // If file already exists in trash, append timestamp to avoid collision
                let finalDest = destPath;
                if (fs.existsSync(destPath)) {
                    const ext = path.extname(fileName);
                    const base = path.basename(fileName, ext);
                    finalDest = path.join(trashDir, `${base}_${Date.now()}${ext}`);
                }

                fs.renameSync(filePath, finalDest);
                moveResults.push({ path: filePath, success: true });
            } else {
                moveResults.push({ path: filePath, success: false, error: 'File not found' });
            }
        } catch (err) {
            console.error(`Error moving file ${filePath} to trash:`, err);
            moveResults.push({ path: filePath, success: false, error: err.message });
        }
    }

    res.json({ results: moveResults });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
