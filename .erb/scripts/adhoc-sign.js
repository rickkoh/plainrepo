/* eslint-disable no-console */
const { execFileSync } = require('child_process');
const path = require('path');

/**
 * Ad-hoc sign macOS builds when no Developer ID certificate is configured.
 *
 * Unsigned Electron apps keep the Electron binary's linker signature, which is
 * invalid once the app bundle is assembled. Apple Silicon Macs then report
 * downloaded builds as "damaged" and refuse to open them. A valid ad-hoc
 * signature lets users open the app via Privacy & Security > Open Anyway.
 */
exports.default = async function adhocSign(context) {
  const { electronPlatformName, appOutDir, packager } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  if (process.env.CSC_LINK || process.env.CSC_NAME) {
    // electron-builder signs with the real certificate instead
    return;
  }

  const appPath = path.join(
    appOutDir,
    `${packager.appInfo.productFilename}.app`,
  );

  console.log(`  • ad-hoc signing  file=${appPath}`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit',
  });
};
