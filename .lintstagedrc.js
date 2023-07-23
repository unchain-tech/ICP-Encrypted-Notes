const path = require('path');

const buildFmtCommand = () => `cargo fmt`;

const buildClippyCommand = () => `cargo clippy`;

const buildLintCommand = (filenames) =>
  `eslint ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`;

const buildPrettierCommand = (filenames) =>
  `prettier --check ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')} `;

module.exports = {
  '**/*.rs': [buildFmtCommand, buildClippyCommand],
  '**/*.{js,jsx,ts,tsx}': [buildLintCommand],
  '**/*.{js,jsx,ts,tsx,json,md}': [buildPrettierCommand],
};
