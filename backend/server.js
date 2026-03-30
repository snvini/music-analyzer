const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const analyzer = require('./analyzer');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

function findAudioFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) findAudioFiles(filePath, fileList);
    else if (/\.(mp3|wav|flac|m4a|ogg|wma|aac)$/i.test(file)) fileList.push(filePath);
  });
  return fileList;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', ffmpeg: true }));

app.get('/api/browse', (req, res) => {
    let currentPath = req.query.path || os.homedir();
    try {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        const folders = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name).sort();
        res.json({ currentPath: path.resolve(currentPath), parentPath: path.dirname(currentPath), folders });
    } catch (err) { res.status(500).json({ error: "Err" }); }
});

app.get('/api/roots', (req, res) => {
    const roots = [{ label: 'Home', path: os.homedir(), icon: 'home' }, { label: 'Desktop', path: path.join(os.homedir(), 'Desktop'), icon: 'monitor' }];
    if (os.platform() === 'win32') {
        try { execSync('powershell -Command "Get-CimInstance Win32_LogicalDisk | Select-Object -ExpandProperty Name"').toString().split(/[\r\n]+/).filter(l => /[A-Z]:/.test(l)).forEach(l => roots.push({ label: `Drive (${l.trim()})`, path: `${l.trim()}\\`, icon: 'hard-drive' })); } catch (e) {}
    }
    res.json(roots);
});

app.get('/api/scan', async (req, res) => {
    const folderPath = req.query.path;
    const quickScan = req.query.quick === 'true';
    if (!folderPath || !fs.existsSync(folderPath)) return res.status(400).json({ error: 'Err' });
    res.setHeader('Content-Type', 'text/event-stream');
    const sendEvent = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    let closed = false;
    req.on('close', () => { closed = true; });

    try {
        const allFiles = findAudioFiles(folderPath);
        sendEvent('progress', { total: allFiles.length, current: 0 });
        for (let i = 0; i < allFiles.length; i++) {
            if (closed) break;
            const file = allFiles[i];
            try {
              const meta = await analyzer.getMetadata(file);
              const analysis = await analyzer.analyzeQuality(file, quickScan);
              const quality = analyzer.classifyBySpectralCurve(analysis, meta);
              sendEvent('result', { id: `${folderPath}-${i}`, filename: meta.filename, folder: meta.folder, codec: meta.codec, sampleRate: meta.sampleRate, bitrate: meta.bitrateStr, status: quality.status, tags: quality.tags, review: quality.review, path: file });
            } catch (err) { console.error(`Error scanning ${file}:`, err); }
            sendEvent('progress', { total: allFiles.length, current: i + 1 });
        }
        if (!closed) sendEvent('status', { message: 'Done' });
        res.end();
    } catch (err) { if (!res.writableEnded) res.end(); }
});

app.get('/api/spectrogram', async (req, res) => {
    const filePath = req.query.path;
    const tempDir = os.tmpdir();
    const hash = Buffer.from(filePath).toString('base64').replace(/[/+=]/g, '_');
    const outPath = path.join(tempDir, `vspec_${hash}.png`);
    try { if (!fs.existsSync(outPath)) await analyzer.generateSpectrogram(filePath, outPath); res.sendFile(outPath); } catch (err) { res.status(500).json({ error: 'Fail' }); }
});

app.post('/api/trash', async (req, res) => {
    const { paths } = req.body;
    for (const filePath of paths) { try { const trashDir = path.join(path.dirname(filePath), '.trash'); if (!fs.existsSync(trashDir)) fs.mkdirSync(trashDir); fs.renameSync(filePath, path.join(trashDir, path.basename(filePath))); } catch (err) {} }
    res.json({ success: true });
});

app.listen(port, '0.0.0.0', () => console.log(`Backend listening at http://localhost:${port}`));
