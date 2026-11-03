import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('assets/algerian-universities');
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const folders = readdirSync(join(root, 'wilayas')).filter((name) => statSync(join(root, 'wilayas', name)).isDirectory());
const errors = [];
const seenIds = new Set();
const seenAssets = new Map();
const assetCounts = { png: 0, jpg: 0, svg: 0 };

if (folders.length !== 58) errors.push(`Expected 58 wilaya folders, found ${folders.length}`);
if (index.wilayaCount !== 58) errors.push(`Expected wilayaCount 58, found ${index.wilayaCount}`);
if (index.institutionCount !== index.institutions.length) errors.push('institutionCount does not match records');

for (const institution of index.institutions) {
  if (seenIds.has(institution.id)) errors.push(`Duplicate institution id: ${institution.id}`);
  seenIds.add(institution.id);
  if (!/^(0[1-9]|[1-4][0-9]|5[0-8])$/.test(institution.wilayaCode)) errors.push(`${institution.id}: invalid legacy wilaya ${institution.wilayaCode}`);
  if (!institution.officialWebsite && institution.nameFr) errors.push(`${institution.id}: missing website source`);
  for (const kind of ['png', 'jpg', 'svg']) {
    const file = institution.logo?.[kind];
    if (!file) continue;
    const fullPath = resolve(root, file);
    if (!fullPath.startsWith(`${root}/`) || !existsSync(fullPath)) {
      errors.push(`${institution.id}: missing or unsafe ${kind} path: ${file}`);
      continue;
    }
    assetCounts[kind] += 1;
    if (!file.toLowerCase().endsWith(`.${kind}`)) errors.push(`${institution.id}: ${kind} path has an unexpected extension: ${file}`);
    const hash = createHash('sha256').update(readFileSync(fullPath)).digest('hex');
    if (seenAssets.has(hash)) errors.push(`Duplicate asset bytes: ${file} and ${seenAssets.get(hash)}`);
    seenAssets.set(hash, file);
    if (!institution.logo.sourcePage || !institution.logo.author || !institution.logo.license) errors.push(`${institution.id}: downloaded logo lacks attribution metadata`);
  }
}

for (const kind of ['png', 'jpg', 'svg']) {
  const declared = index[`downloaded${kind[0].toUpperCase()}${kind.slice(1)}Count`] ?? 0;
  if (declared !== assetCounts[kind]) errors.push(`downloaded${kind[0].toUpperCase()}${kind.slice(1)}Count is ${declared}, expected ${assetCounts[kind]}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${index.institutions.length} institution records, ${folders.length} wilaya folders, ${seenAssets.size} unique local logo files.`);
}
