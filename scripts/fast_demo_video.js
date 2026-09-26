const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG_PATH = require('@ffmpeg-installer/ffmpeg').path;
const TMP_DIR = '/tmp/shipcheck_video_v2';

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const SCENES = [
  {
    id: 'scene1_hero',
    title: 'Scene 1: What is SHIPCHECK?',
    script: 'Meet SHIPCHECK, an autonomous AI agent built for the Sanity Context MCP Hackathon. Before any code change reaches production, SHIPCHECK connects to your Sanity Content Lake via the Model Context Protocol, and automatically checks if your deployment will break anything. It traverses dependency graphs, audits live cluster versions, and resolves documentation contradictions, all without any human guidance.',
    async capture(page, imgPath) {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 1200));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene2_test_scenarios',
    title: 'Scene 2: The Test Scenarios',
    script: 'The agent presents four test scenarios, each designed to demonstrate a different type of deployment risk. A known blocker, a safe upgrade, a policy exception for emergency hotfixes, and an unconstrained service with no rules defined. Lets click the first one to see the agent in action.',
    async capture(page, imgPath) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene3_agent_running',
    title: 'Scene 3: The Agent Thinks Autonomously',
    script: 'When we ask, Can I upgrade the payment service from version 2 to version 4, the agent launches its autonomous ReAct reasoning loop. It executes 13 cognitive steps, looking up services in the knowledge base, scanning version dependencies, checking the live production cluster, and evaluating organizational policies. You can watch each step complete in real time.',
    async capture(page, imgPath) {
      // Click the first test scenario (Canonical Failure / "Will upgrading Payment break anything?")
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const testBtn = buttons.find(
          (b) => b.textContent && (b.textContent.includes('Will upgrading Payment') || b.textContent.includes('Canonical Failure'))
        );
        if (testBtn) testBtn.click();
      });
      // Capture mid-reasoning (the checklist)
      await new Promise((r) => setTimeout(r, 1400));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene4_verdict',
    title: 'Scene 4: The Verdict — Not Safe',
    script: 'The agent reaches its verdict: Not Safe to Deploy. It found that Payment Service version 4 requires Payment SDK version 3 or higher, but your production cluster is running version 2.4.1. If you deploy now, payments will break for all users. It also detected documentation drift where internal docs assume XML, but the official release notes mandate JSON version 2. Every single finding is backed by a specific source document with a trust level.',
    async capture(page, imgPath) {
      // Wait for full result to render
      await new Promise((r) => setTimeout(r, 3000));
      await page.evaluate(() => window.scrollTo(0, 300));
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene5_reasoning_trace',
    title: 'Scene 5: How Did It Figure This Out?',
    script: 'You can expand the reasoning trace to see exactly how the agent reached its conclusion. Each step shows what the agent was thinking, which data source it queried via MCP, what it found, and how it combined the evidence. This is not a black box. Every conclusion has full provenance back to a real Sanity document.',
    async capture(page, imgPath) {
      // Click "How did I figure this out?" to expand
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const traceBtn = buttons.find((b) => b.textContent && b.textContent.includes('How did I figure'));
        if (traceBtn) traceBtn.click();
      });
      await new Promise((r) => setTimeout(r, 800));
      await page.evaluate(() => window.scrollTo(0, 600));
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene6_canvas_graph',
    title: 'Scene 6: The Dependency Map',
    script: 'The detail panel on the right shows the 2-hop dependency graph the agent traversed. Hop zero is your request. Hop one follows the version constraint and discovers Payment Service v4 needs SDK 3.0. Hop two cross-references the live cluster and finds the actual SDK version is only 2.4.1. This structural graph traversal is what catches bugs that vector search completely misses.',
    async capture(page, imgPath) {
      // Click "See Dependency Map" button or the Graph tab
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const graphBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Dependency Map') || b.textContent.includes('2-Hop Graph')));
        if (graphBtn) graphBtn.click();
      });
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene7_simulate_fix',
    title: 'Scene 7: Simulate the Fix',
    script: 'Now watch this. We click Simulate Fix, and the agent re-runs the entire check, but this time with Payment SDK version 3.1.0 applied to the cluster. The 2-hop collision resolves, all constraints are satisfied, and the verdict flips to Safe to Ship. This counterfactual simulation proves the fix works before you touch production.',
    async capture(page, imgPath) {
      // Click "Simulate Fix" button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const simBtn = buttons.find((b) => b.textContent && b.textContent.includes('Simulate Fix'));
        if (simBtn) simBtn.click();
      });
      await new Promise((r) => setTimeout(r, 3500));
      // Switch to Summary tab
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const tab = buttons.find((b) => b.textContent && b.textContent.trim() === 'Summary');
        if (tab) tab.click();
      });
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene8_compare',
    title: 'Scene 8: Why Not Just Use Vector Search?',
    script: 'The comparison page shows why this matters. We asked the same question to a naive vector search system like Pinecone, and it said safe to deploy, a dangerous false positive. It missed the SDK dependency entirely because SDK was not in the search query. SHIPCHECK found it through structural graph traversal, following actual database relationships instead of keyword similarity. This is why Sanity Content Lake and GROQ are superior for production safety.',
    async capture(page, imgPath) {
      await page.goto('http://localhost:3000/compare', { waitUntil: 'networkidle2' });
      await page.evaluate(() => window.scrollTo(0, 100));
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene9_knowledge',
    title: 'Scene 9: The Knowledge Base',
    script: 'Everything the agent knows comes from 18 carefully designed documents in the Sanity Content Lake, project 70rd1u6b. These include service architecture specs, release notes, version constraints, deployment policies, and exception rules. Each document has a trust level from 1 to 10, and the agent uses these to resolve contradictions. All of this is exposed via MCP JSON-RPC, so any AI coding assistant like Claude Code or Cursor can query it directly.',
    async capture(page, imgPath) {
      await page.goto('http://localhost:3000/knowledge', { waitUntil: 'networkidle2' });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 1200));
      await page.screenshot({ path: imgPath });
    },
  },
  {
    id: 'scene10_closing',
    title: 'Scene 10: Ship With Certainty',
    script: 'SHIPCHECK is an autonomous AI agent that connects to Sanity Content Lake via the Model Context Protocol, traverses multi-hop dependency graphs using GROQ, and delivers grounded, provenance-backed verdicts with zero hallucination. Built for the Sanity Context MCP Hackathon. Ship with certainty.',
    async capture(page, imgPath) {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: imgPath });
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
  return 18;
}

async function main() {
  console.log('🎬 Recording SHIPCHECK Full Explanation Demo Video...');
  console.log(`   Scenes: ${SCENES.length}`);

  // 1. Generate audio for each scene
  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const aiffPath = path.join(TMP_DIR, `audio_${scene.id}.aiff`);
    const wavPath = path.join(TMP_DIR, `audio_${scene.id}.wav`);

    // Always regenerate audio
    console.log(`🎙️ [${i + 1}/${SCENES.length}] Generating voice: ${scene.title}...`);
    const safeScript = scene.script.replace(/"/g, '\\"');
    execSync(`say -v Daniel -r 165 -o "${aiffPath}" "${safeScript}"`);
    execSync(`${FFMPEG_PATH} -y -i "${aiffPath}" -ar 44100 -ac 2 "${wavPath}" 2>/dev/null`);

    scene.audioPath = wavPath;
    scene.duration = getAudioDuration(wavPath) + 1.2;
    console.log(`   ✓ Duration: ${scene.duration.toFixed(1)}s`);
  }

  const totalDuration = SCENES.reduce((sum, s) => sum + s.duration, 0);
  console.log(`\n📊 Total estimated duration: ${(totalDuration / 60).toFixed(1)} minutes\n`);

  // 2. Launch Puppeteer at 1080p
  console.log('🌐 Launching browser for 1080p capture...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const sceneVideoPaths = [];

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    console.log(`📸 [${i + 1}/${SCENES.length}] Capturing: ${scene.title}...`);
    const imgPath = path.join(TMP_DIR, `shot_${scene.id}.png`);
    await scene.capture(page, imgPath);

    // Encode scene as still-image video with voiceover
    const sceneMp4 = path.join(TMP_DIR, `clip_${scene.id}.mp4`);
    console.log(`⚡ Encoding ${scene.id} (${scene.duration.toFixed(1)}s)...`);
    execSync(
      `${FFMPEG_PATH} -y -loop 1 -framerate 25 -t ${scene.duration} -i "${imgPath}" -i "${scene.audioPath}" -c:v libx264 -tune stillimage -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${sceneMp4}" 2>/dev/null`
    );
    sceneVideoPaths.push(sceneMp4);
  }

  await browser.close();

  // 3. Concatenate all scenes
  console.log('\n🎞️ Concatenating all scenes into final video...');
  const concatListPath = path.join(TMP_DIR, 'concat_list.txt');
  fs.writeFileSync(
    concatListPath,
    sceneVideoPaths.map((p) => `file '${p}'`).join('\n')
  );

  const finalVideoDesktop = '/Users/rajanmishra/Desktop/sanity/shipcheck_full_demo.mp4';
  const artifactDir = '/Users/rajanmishra/.gemini/antigravity/brain/c3b987fa-8c89-47c9-94d4-6b37591ae12b';
  const finalVideoArtifact = path.join(artifactDir, 'shipcheck_full_demo.mp4');

  execSync(
    `${FFMPEG_PATH} -y -f concat -safe 0 -i "${concatListPath}" -c copy "${finalVideoDesktop}" 2>/dev/null`
  );

  fs.copyFileSync(finalVideoDesktop, finalVideoArtifact);

  const stats = fs.statSync(finalVideoDesktop);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 DEMO VIDEO COMPLETE!`);
  console.log(`📁 File: ${finalVideoDesktop}`);
  console.log(`📦 Size: ${sizeMB} MB`);
  console.log(`⏱️ Duration: ~${(totalDuration / 60).toFixed(1)} minutes`);
  console.log(`🎬 Scenes: ${SCENES.length}`);
}

main().catch((err) => {
  console.error('Video error:', err);
  process.exit(1);
});
