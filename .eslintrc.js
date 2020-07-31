module.exports = {
  processor: `disable/disable`,
  parser: `@typescript-eslint/parser`,
  extends: [
    `plugin:@typescript-eslint/recommended`,
    `plugin:import/errors`,
    `plugin:import/warnings`,
    `plugin:security/recommended`,
    `plugin:sonarjs/recommended`,
    `plugin:import/typescript`,
    `plugin:jest/recommended`,
    `plugin:jest/style`,
  ],
  env: {
    "node": true,
    "jest/globals": true,
  },
  parserOptions: {
    "ecmaVersion": 8,
  },
  plugins: [
    `@typescript-eslint`,
    `import`,
    `disable`,
    `security`,
    `no-secrets`,
    `json-format`,
    `sonarjs`,
    `jest`,
  ],
  "rules": {
    "semi": [
      `error`,
      `never`,
    ],
    "global-require": `off`,
    "comma-dangle": [
      `error`,
      `always-multiline`,
    ],
    "quotes": [
      `error`,
      `backtick`,
    ],
    "no-var": `error`,
    "prefer-const": `error`,
    "max-len": [
      `warn`,
      {
        "code": 80,
      },
    ],
    "object-property-newline": `error`,
    "no-console": `off`,
    "no-secrets/no-secrets": `error`,
    "security/detect-object-injection": `off`,
    // until
    // https://github.com/nodesecurity/eslint-plugin-security/issues/27
    // is fixed
    "security/detect-non-literal-require": `off`,
  },
  "overrides": [
    {
      "files": [
        `src/**/__tests__/*.{js}`,
        `*.test.js`,
      ],
      "env": {
        "jest": true,
      },
    },
    {
      files: [`*.json`],
      settings: {
        "disable/plugins": [`no-secrets`],
      },
    },
  ],
}