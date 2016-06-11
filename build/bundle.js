"use strict";

var typings = require('typings-core'),
    path    = require('path'),
    chalk   = require('chalk');
    
typings.bundle({
    cwd: path.dirname(__dirname),
    out: path.resolve(__dirname, "../dist/main.d.ts")
}).then(() => {
    console.log(chalk.green("bundled type definitions"));
}, err => {
    console.error(chalk.red("failed to bundle type definitions"));
    console.error(chalk.gray(chalk.red("ERROR"), ": %s\n%s"), err.message, err.stack);
});