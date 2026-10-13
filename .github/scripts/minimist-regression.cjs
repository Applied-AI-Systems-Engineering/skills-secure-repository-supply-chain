const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const path = require('node:path');
(async () => {
  const response = await fetch('https://registry.npmjs.org/minimist/1.2.8');
  assert.equal(response.status, 200);
  const metadata = await response.json();
  assert.match(metadata.version, /^1\./);
  const expected = { version: metadata.version, resolved: metadata.dist.tarball, integrity: metadata.dist.integrity };
  console.log('REGISTRY_PROVENANCE ' + JSON.stringify(expected));
  const tarball = await fetch(expected.resolved);
  assert.equal(tarball.status, 200);
  const bytes = Buffer.from(await tarball.arrayBuffer());
  assert.equal('sha512-' + crypto.createHash('sha512').update(bytes).digest('base64'), expected.integrity);
  const temp = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP, 'minimist-regression-'));
  fs.writeFileSync(path.join(temp, 'package.tgz'), bytes);
  cp.execFileSync('tar', ['-xzf', path.join(temp, 'package.tgz'), '-C', temp]);
  const parse = require(path.join(temp, 'package'));
  assert.deepEqual(parse(['--count', '3', '--name', 'demo', 'file']), { _: ['file'], count: 3, name: 'demo' });
  for (const args of [['--__proto__.supplyCourseMarker', '123'], ['--constructor.prototype.supplyCourseMarker', '123'], ['--_.constructor.constructor.prototype.supplyCourseMarker', '123']]) {
    parse(args);
    assert.equal({}.supplyCourseMarker, undefined);
    assert.equal((function () {}).supplyCourseMarker, undefined);
  }
  const oldResponse = await fetch('https://registry.npmjs.org/minimist/1.2.5');
  assert.equal(oldResponse.status, 200);
  const oldMetadata = await oldResponse.json();
  const oldDownload = await fetch(oldMetadata.dist.tarball);
  assert.equal(oldDownload.status, 200);
  const oldBytes = Buffer.from(await oldDownload.arrayBuffer());
  assert.equal('sha512-' + crypto.createHash('sha512').update(oldBytes).digest('base64'), oldMetadata.dist.integrity);
  const oldTemp = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP, 'minimist-negative-control-'));
  fs.writeFileSync(path.join(oldTemp, 'package.tgz'), oldBytes);
  cp.execFileSync('tar', ['-xzf', path.join(oldTemp, 'package.tgz'), '-C', oldTemp]);
  const attacks = [['--__proto__.supplyCourseMarker', '123'], ['--constructor.prototype.supplyCourseMarker', '123'], ['--_.constructor.constructor.prototype.supplyCourseMarker', '123']];
  let detected = 0;
  for (const args of attacks) {
    const childCode = `const parse=require(${JSON.stringify(path.join(oldTemp, 'package'))});parse(${JSON.stringify(args)});console.log(JSON.stringify({object:({}).supplyCourseMarker,function:(function(){}).supplyCourseMarker}));`;
    const result = JSON.parse(cp.execFileSync(process.execPath, ['-e', childCode], { encoding: 'utf8' }).trim());
    if (result.object !== undefined || result.function !== undefined) detected++;
  }
  assert.ok(detected > 0, 'Old 1.2.5 negative control must reproduce at least one pollution case');
  console.log('NEGATIVE_CONTROL_PROVENANCE ' + JSON.stringify({ version: oldMetadata.version, resolved: oldMetadata.dist.tarball, integrity: oldMetadata.dist.integrity }));
  console.log('NEGATIVE_CONTROL_DETECTED ' + detected + ' of 3 pollution cases in isolated child processes');
  const lock = JSON.parse(fs.readFileSync('code/src/AttendeeSite/package-lock.json'));
  const manifest = JSON.parse(fs.readFileSync('code/src/AttendeeSite/package.json'));
  if (process.env.ENFORCE_PATCH === 'true') {
    assert.equal(manifest.dependencies.minimist, '^' + expected.version);
    const entry = lock.dependencies?.minimist || lock.packages?.['node_modules/minimist'];
    assert.ok(entry, 'minimist lock entry required');
    assert.deepEqual({ version: entry.version, resolved: entry.resolved, integrity: entry.integrity }, expected);
    console.log('CHECKED_IN_PATCH_MATCHES_REGISTRY');
  }
  console.log('MINIMIST_REGRESSION_PASS: normal parsing + three prototype pollution cases; legacy app not installed or executed');
})().catch(error => { console.error(error); process.exit(1); });
