import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Compatibility-matrix demo test.
//
// This test is the classroom "fail switch" for compatibility matrix demos.
//
// When the env var BREAK_NODE18=true is set AND the runtime is Node.js 18,
// the assertion below intentionally fails. Toggle BREAK_NODE18 in the
// workflow file (env: BREAK_NODE18: "true") to demonstrate:
//   - fail-fast cancelling siblings (default behaviour)
//   - fail-fast: false letting all combinations finish
//   - continue-on-error rescuing experimental combos
//
// When the toggle is off, every Node version passes — the project remains
// fully working for normal development.
// ---------------------------------------------------------------------------

const nodeMajor = Number(process.versions.node.split('.')[0]);
const breakNode18 = process.env.BREAK_NODE18 === 'true';

describe('compatibility matrix', () => {
  it('runs the Node major check', () => {
    expect(nodeMajor).toBeGreaterThanOrEqual(18);
  });

  it('passes only on supported Node versions (toggle-able)', () => {
    if (breakNode18 && nodeMajor === 18) {
      // Intentionally fails ONLY when BREAK_NODE18=true and on Node 18.
      // This is the demo trigger — flip the env var to disable.
      expect(nodeMajor).toBeGreaterThan(18);
    } else {
      expect(nodeMajor).toBeGreaterThanOrEqual(18);
    }
  });
});
