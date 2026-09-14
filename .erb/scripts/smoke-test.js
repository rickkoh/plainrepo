/* eslint-disable no-console */
/**
 * Launches a packaged build and waits for the renderer to reach the main
 * process over IPC (the 'ipc-example' ping sent from src/renderer/index.tsx).
 * Used in CI to verify that release builds actually start on each platform.
 *
 * Usage: node .erb/scripts/smoke-test.js [path/to/executable]
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 90 * 1000;
const READY_PATTERN = /IPC test: (ping|pong)/;
const buildPath = path.join(__dirname, '../../release/build');

function defaultExecutablePath() {
  switch (process.platform) {
    case 'darwin':
      return path.join(
        buildPath,
        process.arch === 'arm64' ? 'mac-arm64' : 'mac',
        'PlainRepo.app/Contents/MacOS/PlainRepo',
      );
    case 'win32':
      return path.join(buildPath, 'win-unpacked', 'PlainRepo.exe');
    default:
      return path.join(buildPath, 'linux-unpacked', 'plainrepo');
  }
}

const executablePath = process.argv[2] || defaultExecutablePath();

if (!fs.existsSync(executablePath)) {
  console.error(`Smoke test failed: ${executablePath} does not exist`);
  process.exit(1);
}

const env = { ...process.env, ELECTRON_ENABLE_LOGGING: '1' };
// When set, Electron runs as plain Node and never opens a window
delete env.ELECTRON_RUN_AS_NODE;

// CI containers can't use the Chromium SUID sandbox on Linux
const args = process.platform === 'linux' ? ['--no-sandbox'] : [];

console.log(`Launching ${executablePath}`);
const child = spawn(executablePath, args, { env });

let output = '';
let finished = false;
let timer;

function finish(code, message) {
  if (finished) return;
  finished = true;
  clearTimeout(timer);

  if (code === 0) {
    console.log(message);
  } else {
    console.error(message);
    console.error(output);
  }

  if (child.exitCode !== null || child.signalCode !== null) {
    process.exit(code);
  }

  // Wait for the app to quit so no window is left open, force killing if needed
  child.once('exit', () => process.exit(code));
  child.kill();
  setTimeout(() => {
    child.kill('SIGKILL');
    process.exit(code);
  }, 5000);
}

timer = setTimeout(() => {
  finish(1, `Smoke test failed: no IPC response within ${TIMEOUT_MS}ms`);
}, TIMEOUT_MS);

const onData = (data) => {
  output += data.toString();
  if (READY_PATTERN.test(output)) {
    finish(0, 'Smoke test passed: app started and renderer reached main');
  }
};

child.stdout.on('data', onData);
child.stderr.on('data', onData);
child.on('error', (error) => {
  finish(1, `Smoke test failed: could not launch app (${error.message})`);
});
child.on('exit', (code, signal) => {
  finish(1, `Smoke test failed: app exited early (code ${code}, ${signal})`);
});
