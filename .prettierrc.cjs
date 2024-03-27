module.exports = {
  bracketSpacing: true,
  printWidth: 80,
  proseWrap: 'always',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'es5',
  semi: true,
  overrides: [
    {
      files: ['*.html'],
      htmlWhitespaceSensitivity: 'ignore',
      // https://github.com/prettier/prettier-vscode/issues/646#issuecomment-514776589
    },
    {
      files: ['*.md'],
      options: {
        tabWidth: 4,
        printWidth: 1000,
      },
    },
    {
      files: ['package*.json'],
      options: {
        printWidth: 1000,
      },
    },
    {
      files: ['*.yml'],
      options: {
        singleQuote: false,
      },
    },
  ],
};
