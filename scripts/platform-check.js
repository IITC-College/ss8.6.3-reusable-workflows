// Educational helper: simulates a platform-specific compatibility script.
// Reads the BREAK_WINDOWS env flag — when set to 'true' AND running on Windows,
// this script fails on purpose. The instructor flips that flag in the workflow
// to demonstrate compatibility failures on a single matrix combination.

const breakWindows = process.env.BREAK_WINDOWS === 'true';
const isWindows = process.platform === 'win32';

console.log('---- platform-check ----');
console.log(`platform        : ${process.platform}`);
console.log(`BREAK_WINDOWS   : ${breakWindows}`);

if (breakWindows && isWindows) {
  console.error('✗ Simulated Windows-only compatibility failure (BREAK_WINDOWS=true).');
  console.error('  Toggle BREAK_WINDOWS in the workflow to disable this demo failure.');
  process.exit(1);
}

console.log('✓ platform-check passed.');
