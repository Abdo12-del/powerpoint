import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const catalog = readFileSync(new URL('../docs/PROJECT_LIBRARIES.md', import.meta.url), 'utf8');

function readInventory(kind, dependencies) {
  const marker = new RegExp(`<!-- ${kind}:start -->([\\s\\S]*?)<!-- ${kind}:end -->`);
  const match = catalog.match(marker);
  if (!match) throw new Error(`Missing ${kind} inventory markers in docs/PROJECT_LIBRARIES.md`);
  const listed = [...match[1].matchAll(/`([^`]+)`/g)].map(([, name]) => name).sort();
  const expected = Object.keys(dependencies).sort();
  const missing = expected.filter((name) => !listed.includes(name));
  const extra = listed.filter((name) => !expected.includes(name));
  if (missing.length || extra.length) {
    throw new Error(`${kind} library catalog is out of sync. Missing: ${missing.join(', ') || 'none'}; stale: ${extra.join(', ') || 'none'}`);
  }
  return expected.length;
}

const runtimeCount = readInventory('runtime-packages', packageJson.dependencies);
const devCount = readInventory('dev-packages', packageJson.devDependencies);
console.log(`Library catalog is complete: ${runtimeCount} runtime and ${devCount} development packages.`);
