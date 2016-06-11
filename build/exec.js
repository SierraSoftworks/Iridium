"use strict";

const spawn = require('child_process').spawn;
const newProcess = process.argv[2];
const newArgs = process.argv.slice(3).map(arg => arg.replace(/\$([a-zA-Z][a-zA-Z0-9_]*)/g, (match, name) =>  process.env[name] || match));

console.log(`> ${newProcess} ${newArgs.map(arg => `"${arg}"`).join(" ")}`);

const runningProcess = spawn(newProcess, newArgs);
runningProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
});

runningProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
});

runningProcess.on('close', (code) => {
    process.exit(code);
});