import fs from 'node:fs';

function loadWorkflowConfig() {
  try {
    const raw = fs.readFileSync(new URL('./workflow.config.json', import.meta.url), 'utf8');
    return JSON.parse(raw);
  } catch {
    return { issuePrefix: 'fl', issueSeparator: '#' };
  }
}

const workflowConfig = loadWorkflowConfig();
const prefix = workflowConfig.issuePrefix || 'fl';
const sep = workflowConfig.issueSeparator || '#';

// Strictly matches "fl#<number>" without spaces in commit messages
const ISSUE_TAG_REGEX = new RegExp(`\\b${prefix}\\${sep}\\d+$`);

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'header-issue-tag': ({ header }) => {
          if (!header) {
            return [false, 'Commit header cannot be empty'];
          }
          const trimmed = header.trim();
          const isValid = ISSUE_TAG_REGEX.test(trimmed);
          return [
            isValid,
            `Commit header must end with an issue tag in format "${prefix}${sep}<issue-number>" (e.g. "feat: add login flow ${prefix}${sep}12" or "chore: setup linters ${prefix}${sep}2")`
          ];
        }
      }
    }
  ],
  rules: {
    'header-issue-tag': [2, 'always'],
    'header-max-length': [2, 'always', 120]
  }
};
