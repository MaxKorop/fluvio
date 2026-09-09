const ISSUE_TAG_REGEX = /\bfm#\d+$/;

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
            'Commit header must end with a project issue tag in format "fm#<issue-number>" (e.g. "feat: add login flow fm#12" or "chore(ci): update workflow fm#2")'
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
