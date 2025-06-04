import process from 'node:process';
import { execSync } from 'node:child_process';
import SimpleGit from 'simple-git';

// Ref https://git-scm.com/docs/git-status
function fileToStage(all, current) {
  const { path } = current;
  const index = current.index.trim();
  const working = current.working_dir.trim();

  // Not a PostCSS file
  if (!path.endsWith('.pcss')) return undefined; 

  // Not indexed or untracked
  if (!index || `${index + working}` === '??') return undefined; 
  
  if (index && working) throw new Error(`PostCSS (${path}) file has staged and unstaged changes. Cannot process file.`);

  const target = path.replace('.pcss', '.css');
  const css = all.find((f) => f.path === target); // Check if target is already staged
  
  if (!css) return target; // No file, needs to be staged
  if (css.working_dir.trim()) return target; // CSS file has changes, needs to be regenerated & staged
  return undefined; // Target file is already staged
}

try {
  const git = SimpleGit();
  const { files } = await git.status();
  files.forEach((file) => {
    const css = fileToStage(files, file);
    if (css) {
      console.log(`Source for file (${css}) modified, rebuilding...`);
      execSync(`node tools/build/scripts/postcss.js ${file.path}`);
      console.log(`Staging ${css}`);
      git.add(css);
    }
  });

} catch (e) {
  if (e.status) process.exit(e.status);
  console.log(e.message);
  process.exit(1);
}