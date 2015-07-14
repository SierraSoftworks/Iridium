# Contributing to Iridium
This guide should get you started with most of the information you'll need to begin contributing to Iridium's development.
We've tried to keep the development process as straightforward as possible through a combination of CI tools, unit tests and gulp.

## Setting up your system
You'll need to have an up to date version of Node.js installed (anything after *0.10.x* should work) - you can grab a copy from
[nodejs.org/download](https://nodejs.org/download/). Once you've got that installed you'll have `npm` available - the Node.js
Package Manager.

Next thing to do is install Gulp on your system, just run `npm install -g gulp` and wait for that to finish. That will add the
`gulp` command line utility which you will use to manage the Iridium development workflow.

## Project layout

 - **benchmarks** holds any benchmark files, they're not currently used for unit testing or anything like that, but you can use
   them as a rough map between the different comparison libraries. If you decide to write any benchmarks, please stick to using
   TypeScript as it will help with refactoring should the API change.
 - **build** holds JavaScript files consumed by Gulp for the various gulp tasks available to you. Files within this folder are
   automatically run whenever you execute `gulp` within the project directory.
 - **dist** holds the compiled JavaScript and JSMap files, its structure mirrors that of the project's root directory. Generally
   you won't have any need to fiddle in here unless you're debugging a code generation issue.
 - **example** holds a couple of example files which show how you can go about doing certain things within Iridium. If you've got
   a good idea for an example then this is where you should put it. Generally you'll write these in TypeScript, but if you want
   to create an example of how to do things in JavaScript or any other JS targetting language then go right ahead.
 - **lib** *This is where the magic happens!* TypeScript files which make up the heart of Iridium.
 - **test** Probably the second most important folder, it holds all of the unit tests used to ensure that Iridium is working the
   way it was intended.
 - **typings** holds the TypeScript definition files we use to interface with some of the JavaScript dependencies. These are
   primarily pulled in by [tsd](http://definitelytyped.org/tsd/) from the [DefinitelyTyped](http://definitelytyped.org/)
   project.
   
## Developing on Iridium
Iridium's development workflow is almost entirely automated through a combination of Gulp and NPM hooks. The most common command
you'll be using is `gulp watch` which will watch the **lib** and **test** folders for changes, compile the TypeScript files and
run the unit tests. You'll generally leave this running while you make changes to be notified almost immediately when things
break.

## Pull Request Requirements
1. **KISS** - Keep your pull requests as small and to the point as possible, it makes reviewing the code easier and generally reduces
   the likelihood of merge conflicts - which will slow down the process of reviewing your PR.
2. **TEST** - Make sure that whatever new functionality you add has ample unit tests to go along with it, we use code coverage as an
   automated requirement for PR merges and it helps make sure we don't break things later down the road. If you aren't sure about
   how to write unit tests, please feel free to ask for help in your PR.
3. **KEEP** - Make sure that whatever changes you make, they keep to the existing Iridium API. Iridium adopts the 
   [Semantic Versioning](http://semver.org) specification, so breaking API changes will result in a major version bump, which
   will further slow the process of accepting your pull request (bumping the major version requires work from developers who make
   use of our library in most cases - which isn't ideal). The easiest way to ensure that your changes maintain the Iridium API
   is just by keeping all the existing unit tests as they are.
