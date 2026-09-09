#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const msgFile = process.argv[2];
if (!msgFile) {
  process.exit(0);
}

try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore']
  }).trim();

  // Pattern matching issue number in branch: e.g. chore/7-apps-setup or feat/auth#12-login-flow
  const match = branch.match(/\b(?:#|\/|-)?(\d+)-/);
  if (!match) {
    process.exit(0);
  }

  const issueNumber = match[1];
  const content = readFileSync(msgFile, 'utf8');

  // If already tagged with fm#<number> or if it's a merge/revert, skip
  if (/fm#\d+/i.test(content) || /^Merge /i.test(content) || /^Revert /i.test(content)) {
    process.exit(0);
  }

  const lines = content.split('\n');
  if (lines.length > 0 && lines[0].trim().length > 0) {
    lines[0] = `${lines[0].trimEnd()} fm#${issueNumber}`;
    writeFileSync(msgFile, lines.join('\n'), 'utf8');
  }
} catch {
  // Fail silently so it never breaks git workflow unexpectedly
  process.exit(0);
}
