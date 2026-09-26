const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG_PATH = require('@ffmpeg-installer/ffmpeg').path;
const TMP_DIR = '/tmp/shipcheck_video';

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Scene definitions with script and actions
const SCENES = [
  {
    id: 'scene1_intro',
    title: 'Scene 1: Introduction & Mission',
    script: 'Welcome to SHIPCHECK, the pre-flight production change verification agent built for the Sanity Context MCP Hackathon. Before any engineer or autonomous coding assistant deploys a change to production, SHIPCHECK evaluates whether that plan will break the system.',
    url: 'http://localhost:3000',
    async record(page, outPattern, durationSec) {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.evaluate(() => window.scrollTo(0, 0));
      const fps = 10;
      const totalFrames = Math.ceil(durationSec * fps);
      for (let i = 0; i < totalFrames; i++) {
        // subtle gentle scroll down
        const progress = i / totalFrames;
        const scrollY = Math.min(350, progress * 400);
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.screenshot({ path: `${outPattern}_${String(i).padStart(4, '0')}.png` });
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    },
  },
  {
    id: 'scene2_vector_contrast',
    title: 'Scene 2: Vector Search Blindness',
    script: 'Standard AI agents rely on vector similarity search or Pinecone. But for production infrastructure, vector search is dangerous. If you ask can I upgrade payment service to version 4, vector search says safe, completely missing upstream dependencies and causing a severe outage. SHIPCHECK solves this through deterministic graph traversal over Sanity Content Lake.',
    url: 'http://localhost:3000/compare',
    async record(page, outPattern, durationSec) {
      await page.goto('http://localhost:3000/compare', { waitUntil: 'networkidle2' });
      await page.evaluate(() => window.scrollTo(0, 0));
      const fps = 10;
      const totalFrames = Math.ceil(durationSec * fps);
      for (let i = 0; i < totalFrames; i++) {
        const progress = i / totalFrames;
        const scrollY = Math.min(500, progress * 550);
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.screenshot({ path: `${outPattern}_${String(i).padStart(4, '0')}.png` });
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    },
  },
  {
    id: 'scene3_canonical_failure',
    title: 'Scene 3: Canonical Failure Test',
    script: 'Let us test our canonical production scenario: upgrading Payment Service from v2 to v4. SHIPCHECK executes a two-hop GROQ graph traversal against live Sanity documents. The verdict: DO NOT SHIP YET. It instantly detects that Payment Service v4 requires Payment SDK 3.0 or higher, but the active production cluster is running version 2.4.1. Furthermore, it catches internal documentation drift where webhook schemas have shifted from XML to JSON version 2.',
    url: 'http://localhost:3000',
    async record(page, outPattern, durationSec) {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      // Click canonical scenario button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const canonicalBtn = buttons.find(b => b.textContent && b.textContent.includes('CANONICAL FAILURE'));
        if (canonicalBtn) canonicalBtn.click();
      });
      // Wait for check result
      await new Promise(r => setTimeout(r, 1200));

      const fps = 10;
      const totalFrames = Math.ceil(durationSec * fps);
      for (let i = 0; i < totalFrames; i++) {
        const progress = i / totalFrames;
        // Focus down on the VerdictCard
        const scrollY = 400 + Math.min(300, progress * 350);
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.screenshot({ path: `${outPattern}_${String(i).padStart(4, '0')}.png` });
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    },
  },
  {
    id: 'scene4_remediation_plan',
    title: 'Scene 4: Audio Briefing & Actionable Remediation',
    script: 'Engineers can listen to a mission control verbal briefing with one click. Even better, SHIPCHECK generates an automated four-phase remediation plan with copyable kubectl rollout commands, automated verification checks, and emergency rollback procedures.',
    url: 'http://localhost:3000',
    async record(page, outPattern, durationSec) {
      // scroll to remediation panel
      await page.evaluate(() => window.scrollTo(0, 950));
      const fps = 10;
      const totalFrames = Math.ceil(durationSec * fps);
      for (let i = 0; i < totalFrames; i++) {
        const progress = i / totalFrames;
        const scrollY = 950 + Math.min(450, progress * 500);
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.screenshot({ path: `${outPattern}_${String(i).padStart(4, '0')}.png` });
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    },
  },
  {
    id: 'scene5_simulate_patch',
    title: 'Scene 5: Live Cluster Fix Simulation',
    script: 'Watch what happens when we simulate patching the cluster with SDK version 3.1.0. The graph dynamically recalculates, the two-hop collision is resolved, and the verdict live-flips to SAFE TO SHIP. SHIPCHECK operates as a living, reactive verification control loop.',
    url: 'http://localhost:3000',
    async record(page, outPattern, durationSec) {
      await page.evaluate(() => window.scrollTo(0, 650));
      await new Promise(r => setTimeout(r, 800));

      // Click Simulate patch button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const simBtn = buttons.find(b => b.textContent && b.textContent.includes('Simulate SDK v3.1.0'));
        if (simBtn) simBtn.click();
      });
      await new Promise(r => setTimeout(r, 1200));

      const fps = 10;
      const totalFrames = Math.ceil(durationSec * fps);
      for (let i = 0; i < totalFrames; i++) {
        await page.screenshot({ path: `${outPattern}_${String(i).padStart(4, '0')}.png` });
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    },
  },
  {
    id: 'scene6_analysis_knowledge',
    title: 'Scene 6: Graph Analysis & Knowledge Lake',
    script: 'Every single finding has complete cryptographic provenance back to eighteen load-bearing documents in the Sanity Content Lake, exposed via Model Context Protocol JSON-RPC for Claude Code and Cursor. Ship with certainty, with SHIPCHECK.',
    url: 'http://localhost:3000/analysis',
    async record(page, outPattern, durationSec) {
      await page.goto('http://localhost:3000/analysis', { waitUntil: 'networkidle2' });
      await page.evaluate(() => window.scrollTo(0, 0));
      const fps = 10;
      const totalFrames = Math.ceil(durationSec * fps);
      for (let i = 0; i < totalFrames; i++) {
        const progress = i / totalFrames;
        const scrollY = Math.min(600, progress * 650);
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.screenshot({ path: `${outPattern}_${String(i).padStart(4, '0')}.png` });
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    },
  },
];

function getAudioDuration(wavPath) {
  const out = execSync(`${FFMPEG_PATH} -i "${wavPath}" 2>&1 | grep "Duration"`, { encoding: 'utf-8' });
  const match = out.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    const hours = parseFloat(match[1]);
    const mins = parseFloat(match[2]);
    const secs = parseFloat(match[3]);
    return hours * 3600 + mins * 60 + secs;
  }
  return 15;
}

async function main() {
  console.log('🎬 Starting SHIPCHECK 2-Minute Demo Video Generation...');

  // 1. Generate Voiceover Audios using macOS `say` with Daniel voice
  console.log('🎙️ Generating AI voice narration...');
  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const aiffPath = path.join(TMP_DIR, `audio_${scene.id}.aiff`);
    const wavPath = path.join(TMP_DIR, `audio_${scene.id}.wav`);
    console.log(`   [Voice ${i + 1}/${SCENES.length}] ${scene.title}...`);
    execSync(`say -v Daniel -r 170 -o "${aiffPath}" "${scene.script.replace(/"/g, '\\"')}"`);
    execSync(`${FFMPEG_PATH} -y -i "${aiffPath}" -ar 44100 -ac 2 "${wavPath}" 2>/dev/null`);
    scene.audioPath = wavPath;
    scene.duration = getAudioDuration(wavPath) + 1.2; // slight pause after speaking
    console.log(`      Duration: ${scene.duration.toFixed(1)}s`);
  }

  // 2. Launch Puppeteer Browser
  console.log('🌐 Launching headless browser for screen recording...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 3. Render and record each scene
  const sceneVideoPaths = [];
  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    console.log(`🎥 Recording ${scene.title} (${scene.duration.toFixed(1)}s)...`);
    const framePattern = path.join(TMP_DIR, `frame_${scene.id}`);
    await scene.record(page, framePattern, scene.duration);

    // Encode scene video with audio
    const sceneMp4 = path.join(TMP_DIR, `${scene.id}.mp4`);
    console.log(`   ⚡ Encoding ${scene.id}.mp4...`);
    const encodeCmd = `${FFMPEG_PATH} -y -framerate 10 -i "${framePattern}_%04d.png" -i "${scene.audioPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${sceneMp4}" 2>/dev/null`;
    execSync(encodeCmd);
    sceneVideoPaths.push(sceneMp4);
  }

  await browser.close();

  // 4. Concatenate all scenes into final video
  console.log('🎞️ Concatenating all scenes into final demo video...');
  const concatListPath = path.join(TMP_DIR, 'concat_list.txt');
  fs.writeFileSync(
    concatListPath,
    sceneVideoPaths.map((p) => `file '${p}'`).join('\n')
  );

  const finalVideoDesktop = '/Users/rajanmishra/Desktop/sanity/shipcheck_demo_2min.mp4';
  const artifactDir = '/Users/rajanmishra/.gemini/antigravity/brain/c3b987fa-8c89-47c9-94d4-6b37591ae12b';
  const finalVideoArtifact = path.join(artifactDir, 'shipcheck_demo_2min.mp4');

  execSync(
    `${FFMPEG_PATH} -y -f concat -safe 0 -i "${concatListPath}" -c copy "${finalVideoDesktop}" 2>/dev/null`
  );

  fs.copyFileSync(finalVideoDesktop, finalVideoArtifact);

  const stats = fs.statSync(finalVideoDesktop);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`🎉 VIDEO SUCCESSFULLY GENERATED:`);
  console.log(`   Path: ${finalVideoDesktop}`);
  console.log(`   Size: ${sizeMB} MB`);
}

main().catch((err) => {
  console.error('Video generation error:', err);
  process.exit(1);
});
