/*
 This is the PostCSS processing file. It's used in two ways:
 1. Manually as a build task, via `npm run build`
 2. Automatically as a pre-commit hook
*/

import path from 'node:path';
import fs from 'node:fs/promises';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';

// Get the current directory - normalize for Windows
const currentDir = process.cwd().replace(/^\/([A-Za-z]:)/, '$1');


async function processFile(file) {
  console.log('Processing file:', file);
  const content = await fs.readFile(file, 'utf8');
  const target = file.replace('.pcss', '.css');

  console.log('Source:', file);
  console.log('Output:', target);
  await postcss([
    postcssImport(),
    postcssNested(),
    postcssPresetEnv({
      browsers: ['> 1%', 'last 2 versions', 'not dead'],
      features: {
        'nesting-rules': false,
      },
    }),
  ]).process(content, {
    from: file,
    to: target,
  }).then((result) => {
    return fs.writeFile(target, result.css);
  }).catch((err) => {
    console.error('Error processing file:', err);
  });
}

async function processAllFiles() {
  for await (const file of fs.glob('**/*.pcss')) {
    await processFile(file);
  }
}

if (process.argv[2]) {
  await processFile(process.argv[2]);
} else {
  // Otherwise, process all files (for initial build)
  await processAllFiles().catch((err) => {
    console.error('Error processing files:', err);
  });
}