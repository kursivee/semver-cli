const fs = require('fs');
const semver = require('semver');
const exec = require('child_process').exec;

const packagePath = './resources/package.json';

const content = fs.readFileSync(packagePath);
const JSONContent = JSON.parse(content);


console.log(semver.inc(JSONContent.version, 'patch'));

JSONContent.version = semver.inc(JSONContent.version, 'patch');

fs.writeFileSync(packagePath, JSON.stringify(JSONContent, null, 2));

exec(`git tag ${JSONContent.version}`);