#!/usr/bin/env node

import { execSync } from 'node:child_process';

const VALID_TYPES = [
  'feat',
  'fix',
  'chore',
  'refactor',
  'docs',
  'style',
  'perf',
  'test',
  'build',
  'ci',
  'revert'
];

const BYPASS_BRANCHES = new Set(['main', 'master', 'develop', 'staging', 'HEAD']);

// Pattern: <type>/[<scope>#]<issue-number>-<branch-name>
// - type: conventional commit types
// - scope: optional (can be followed by #, /, or -)
// - issue-number: 1+ digits
// - branch-name: unrestricted number of words separated by hyphens/underscores
const BRANCH_REGEX =
  /^(feat|fix|chore|refactor|docs|style|perf|test|build|ci|revert)\/(?:(?:([a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]|[a-zA-Z])[#\/-])|([a-zA-Z0-9_-]+)#)?(\d+)-([a-zA-Z0-9_-]+)$/;

function getCurrentBranch() {
  if (process.argv[2]) {
    return process.argv[2].trim();
  }
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
  } catch {
    console.error('⚠️  Failed to determine current git branch.');
    process.exit(1);
  }
}

function validateBranch(branchName) {
  // Strip refs/heads/ if present (e.g. from git hooks or CI)
  const cleanBranch = branchName.replace(/^refs\/heads\//, '');

  if (BYPASS_BRANCHES.has(cleanBranch)) {
    console.log(`ℹ️  Bypassing branch lint for protected branch: "${cleanBranch}"`);
    return true;
  }

  const match = cleanBranch.match(BRANCH_REGEX);

  if (!match) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ INVALID BRANCH NAME:', cleanBranch);
    console.error('='.repeat(70));
    console.error('\nBranch names must follow the format:');
    console.error('  <type>/[<scope>#]<issue-number>-<branch-name>\n');
    console.error('Rules:');
    console.error(`  • Type must be one of: ${VALID_TYPES.join(', ')}`);
    console.error('  • Scope and # are optional (e.g., "auth#", "web#", or none)');
    console.error('  • Issue number is required (e.g., 7, 12, 42)');
    console.error('  • Branch name is descriptive words separated by hyphens (no length limit)\n');
    console.error('Valid Examples:');
    console.error('  ✔ chore/7-apps-setup');
    console.error('  ✔ chore/2-automations');
    console.error('  ✔ feat/auth#12-login-flow');
    console.error('  ✔ fix/web#42-button-padding-on-mobile');
    console.error('  ✔ feat/12-add-user-profile-screen');
    console.error('  ✔ fix/web-svc#99-crash-on-refresh-issue-when-typing');
    console.error('='.repeat(70) + '\n');
    return false;
  }

  const [, type, scopeA, scopeB, issueNumber, branchDesc] = match;
  const scope = scopeA || scopeB;

  console.log('✅ Branch name is valid:');
  console.log(`   Branch:  ${cleanBranch}`);
  console.log(`   Type:    ${type}`);
  if (scope) {
    console.log(`   Scope:   ${scope}`);
  }
  console.log(`   Issue:   #${issueNumber}`);
  console.log(`   Summary: ${branchDesc}`);
  return true;
}

const branch = getCurrentBranch();
const isValid = validateBranch(branch);

if (!isValid) {
  process.exit(1);
}
