// Educational helper: prints the matrix-job runtime context.
// Each matrix combination will run this and produce a unique line.
// Useful for showing students which combination is currently executing.

import os from 'node:os';

const nodeMajor = Number(process.versions.node.split('.')[0]);
const platform = process.platform;
const runnerOs = process.env.RUNNER_OS ?? '(local)';
const matrixOs = process.env.MATRIX_OS ?? '(unset)';
const matrixNode = process.env.MATRIX_NODE ?? '(unset)';
const envName = process.env.MATRIX_ENV_NAME ?? 'standard';
const experimental = process.env.MATRIX_EXPERIMENTAL === 'true';

console.log('==================================================');
console.log('  MATRIX JOB CONTEXT');
console.log('==================================================');
console.log(`  matrix.os            : ${matrixOs}`);
console.log(`  matrix.node-version  : ${matrixNode}`);
console.log(`  matrix.environment   : ${envName}`);
console.log(`  matrix.experimental  : ${experimental}`);
console.log('--------------------------------------------------');
console.log(`  RUNNER_OS            : ${runnerOs}`);
console.log(`  process.platform     : ${platform}`);
console.log(`  Node.js version      : ${process.versions.node} (major: ${nodeMajor})`);
console.log(`  OS release           : ${os.release()}`);
console.log(`  CPU arch             : ${process.arch}`);
console.log('==================================================');

if (experimental) {
  console.log('  ⚗  EXPERIMENTAL ENVIRONMENT — failures will not break the pipeline.');
}
