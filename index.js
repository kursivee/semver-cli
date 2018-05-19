#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const semver = require('semver');
const exec = require('child_process').exec;

const PROJECT_PACKAGE_PATH = './package.json';
const PROJECT_VERSION = JSON.parse(fs.readFileSync(PROJECT_PACKAGE_PATH)).version;

program
    .version(PROJECT_VERSION)
    .command('releaseType [targetPackagePath]', 'create releaseType from package.json')
    .option('-p, --patch', 'Patch version')
    .option('-m, --minor', 'Minor version')
    .option('-M, --major', 'Major version')
    .option('--push', 'Push to tag to repository')
    .option('-v, --verbose', 'Enable logging')
    .parse(process.argv);

let releaseType = null;
if(program.patch) {
    releaseType = 'patch';
} else if(program.minor) {
    releaseType = 'minor';
} else if(program.major) {
    releaseType = 'major';
} else {
    console.log('No release type specified. Must be one of patch, minor, or major.');
    return;
}
if(!program.verbose) {
    console.log = () => {};
}

const TARGET_PACKAGE_PATH = program.args[0];
const packageContent = fs.readFileSync(TARGET_PACKAGE_PATH);
const JSONContent = JSON.parse(packageContent);
console.log(`Retrieved package content from ${TARGET_PACKAGE_PATH}`);

JSONContent.version = semver.inc(JSONContent.version, releaseType);
console.log(`Version updated to ${JSONContent.version}`);
fs.writeFileSync(TARGET_PACKAGE_PATH, JSON.stringify(JSONContent, null, 2));
console.log(`Overwrote package.json at ${TARGET_PACKAGE_PATH}`);
exec(`git tag ${JSONContent.version}`, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`Tag ${JSONContent.version} created`);
});


if(program.push) {
    exec(`git push origin ${JSONContent.version}`, (error, stdout) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}