"use strict";

const spawn = require('child_process').spawn;
const fs = require('fs');
const chalk = require('chalk');

const commitLineRegex = /^([a-f0-9]+) (?:\(([^)]+)\) )?(.+)$/;
const refspecRegex = /(?:\w+\/([^\s,]+))|(?:tag\: ([^\s,]+))|(?:HEAD -> ([^\s,]+))/g;

const gitLog = spawn("git", ["log", "--oneline", "--decorate"]);

const projectUrl = "https://github.com/SierraSoftworks/Iridium";

let parsedCommits = 0;
let changelog = [
    "# Iridium Changelog",
    "This changelog is generated automatically based on commits made to Iridium.",
    "For a human friendly description of what changed in each release, take a look",
    `at the [Releases](${projectUrl}/releases) page.`,
    ""
];

let hasRelease = false;

function generateTablet(content, colour, url) {
    return `<a style="border-radius: 2px; padding: 4px 8px; background: ${colour}; color: #fff;" href="${url}">${content}</a>`
}

gitLog.stdout.on('data', data => {
    const commits = data.toString('utf8');

    commits.split('\n').forEach(commit => {
        if (!commit) return;

        const commitLineMatch = commitLineRegex.exec(commit);
        if (!commitLineMatch) {
            console.error(chalk.red("failed to parse commit: ", chalk.white('%s')), commit);
            return;
        }

        const sha = commitLineMatch[1];
        const refSpec = commitLineMatch[2];
        const message = commitLineMatch[3];

        if (refSpec) {
            let properties = {
                localHead: false,
                version: false,
                tags: [],
                branches: []
            }
            
            let refspecMatch;
            while (refspecMatch = refspecRegex.exec(refSpec)) {
                if (refspecMatch[1]) {
                    // origin/(xxxx)
                    properties.branches.push(refspecMatch[1]);
                } else if(refspecMatch[2]) {
                    // tag: (xxxx)
                    const tag = refspecMatch[2];
                    if (tag.match(/^v[\d\w\-\.]+$/)) {
                        properties.version = tag.substring(1);
                    }

                    properties.tags.push(refspecMatch[2]);
                } else if(refspecMatch[3]) {
                    // HEAD -> (xxxx)
                    properties.localHead = refspecMatch[3];
                }
            }

            if (properties.version) {
                changelog.push("");
                changelog.push(`## Version [${properties.version}](${projectUrl}/releases/tag/v${properties.version})`);
                hasRelease = true;
            }

            if (properties.tags.length) {
                changelog.push(`${properties.tags.map(tag => generateTablet(`tag: **${tag}**`, "rgb(64, 120, 192)", `${projectUrl}/releases/tag/${tag}`)).join(' ')}`);
            }


            if (properties.version) {
                if (properties.branches.length) {
                    changelog.push(`${properties.branches.map(branch => generateTablet(`branch: **${branch}**`, "rgb(108, 198, 68)", `${projectUrl}/tree/${branch}`)).join(' ')}`);
                }

                changelog.push("");
                changelog.push("```sh");
                changelog.push(`npm install iridium@${properties.version}`);
                changelog.push("```");
                changelog.push("");
                changelog.push('### Changes');
            }
        }

        if (hasRelease) { 
            changelog.push(` - [${sha}](${projectUrl}/commit/${sha}) ${message}`);
        }
        parsedCommits++;
    });
});

gitLog.on('close', code => {
    if (code !== 0) {
        console.error(chalk.red("failed to generate changelog"));
        process.exit(code);
    }

    fs.writeFile('CHANGELOG.md', changelog.join("\n"), (err) => {
        if (err) {
            console.error("%s: %s", chalk.red("ERROR"), err.message);
            process.exit(1);
        }

        console.log(chalk.green("generated changelog from %d commits"), parsedCommits);
    });

});
