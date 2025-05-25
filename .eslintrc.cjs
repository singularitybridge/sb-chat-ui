module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    quotes: ['error', 'single'],
    '@typescript-eslint/no-explicit-any': 'off',
    'react/prop-types': 'off', // Disable prop-types as we use TypeScript
    'react/react-in-jsx-scope': 'off', // React 17+ doesn't require React to be in scope for JSX
    'react/jsx-uses-react': 'off', // React 17+ doesn't require React to be in scope for JSX
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
  },
};
