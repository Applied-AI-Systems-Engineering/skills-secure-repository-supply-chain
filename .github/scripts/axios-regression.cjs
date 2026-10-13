const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const path = require('node:path');
const http = require('node:http');
(async () => {
  const metadataResponse = await fetch('https://registry.npmjs.org/axios/0.34.0');
  assert.equal(metadataResponse.status, 200);
  const metadata = await metadataResponse.json();
  const expected = { version: metadata.version, resolved: metadata.dist.tarball, integrity: metadata.dist.integrity };
  const lock = JSON.parse(fs.readFileSync('code/src/AttendeeSite/package-lock.json'));
  const entry = lock.packages['node_modules/axios'];
  assert.deepEqual({version:entry.version,resolved:entry.resolved,integrity:entry.integrity},expected);
  assert.equal(JSON.parse(fs.readFileSync('code/src/AttendeeSite/package.json')).dependencies.axios,'^0.34.0');
  const download = await fetch(expected.resolved);
  assert.equal(download.status, 200);
  const bytes = Buffer.from(await download.arrayBuffer());
  assert.equal('sha512-'+crypto.createHash('sha512').update(bytes).digest('base64'),expected.integrity);
  console.log('AXIOS_REGISTRY_PROVENANCE '+JSON.stringify(expected));
  const temp = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP,'axios-isolated-'));
  fs.writeFileSync(path.join(temp,'package.json'),JSON.stringify({private:true,dependencies:{axios:'0.34.0'}}));
  cp.execFileSync('npm',['install','--ignore-scripts','--no-audit','--no-fund'],{cwd:temp,stdio:'inherit'});
  const axios = require(path.join(temp,'node_modules/axios'));
  assert.equal(axios.VERSION,'0.34.0');
  const installed = JSON.parse(fs.readFileSync(path.join(temp,'package-lock.json'))).packages['node_modules/axios'];
  assert.equal(installed.integrity,expected.integrity);
  const server = http.createServer((req,res)=>{
    if(req.url==='/redirect'){res.writeHead(302,{Location:'/json'});return res.end();}
    if(req.url==='/slow'){return setTimeout(()=>res.end('slow'),200);}
    let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({method:req.method,body:body?JSON.parse(body):null}));});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try {
    const client=axios.create({baseURL:base,proxy:false,timeout:1000});
    assert.deepEqual((await client.get('/json')).data,{method:'GET',body:null});
    assert.deepEqual((await client.post('/json',{synthetic:'fixture'})).data,{method:'POST',body:{synthetic:'fixture'}});
    const redirect=await client.get('/redirect',{maxRedirects:0,validateStatus:()=>true});assert.equal(redirect.status,302);
    await assert.rejects(client.get('/slow',{timeout:20}),e=>e.code==='ECONNABORTED');
    const inherited=Object.create({method:'post'});inherited.url='/json';
    const response=await client.request(inherited);assert.equal(response.data.method,'GET');
    console.log('AXIOS_ISOLATED_PASS: JSON GET/POST, maxRedirects=0, timeout, inherited-method hardening; loopback fixtures only');
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  console.log('LEGACY_AZURE_APP_NOT_INSTALLED_OR_EXECUTED; only isolated axios and its dependency tree installed with scripts disabled');
})().catch(error=>{console.error(error);process.exit(1);});
