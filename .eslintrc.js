module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    es6: true,
  },
  extends: [
    'airbnb',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'arrow-parens': ['error', 'always'],
    'eol-last': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'no-multi-spaces': ['error'],
    'keyword-spacing': ['error'],
    'semi-spacing': ['error'],
    'comma-dangle': ['error', 'always-multiline'],
  },
};
