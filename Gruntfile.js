var tsconfig = require('./tsconfig.json');

module.exports = function (grunt) {
	"use strict";
	
	grunt.initConfig({
		ts: {
			options: tsconfig.compilerOptions,

			dev: {
				src: tsconfig.files,
				options: {
					watch: 'lib',
					fast: 'never'
				}
			},
			test: {
				src: tsconfig.files,
				options: {
					sourceMap: true,
					fast: 'never'
				}
			},
			release: {
				src: ["index.ts", "lib/**/*.ts"],
				options: {
					sourceMap: false,
					fast: 'never'
				}
			}
		},
		mochacli: {
			options: {
				require: ["test/support/chai", "test/support/config"],
				files: "test/*.js",
				timeout: '10s'
			},

			default: {

			}
		},
		mocha_istanbul: {
			coverage: {
				src: 'test',
				root: 'lib',
				options: {
					mask: '*.js',
					reportFormats: ['lcovonly', 'html'],
					timeout: '10s',
					require: ["test/support/chai", "test/support/config"],
					check: {
						lines: 75,
						statements: 75
					}
				}
			},

			coveralls: {
				src: 'test',
				root: 'lib',
				options: {
					mask: '*.js',
					coverage: true,
					reportFormats: ['lcovonly'],
					timeout: '10s',
					require: ["test/support/chai", "test/support/config"]
				}
			}
		},

		clean: {
			definitions: ["*.d.ts", "!iridium.d.ts", "!_references.d.ts", "benchmarks/**/*.d.ts", "example/**/*.d.ts", "lib/**/*.d.ts", "test/**/*.d.ts"],
			sourceMaps: ["*.map", "benchmarks/**/*.map", "example/**/*.map", "lib/**/*.map", "test/**/*.map"],
			compiledFiles: ["*.js", "!Gruntfile.js", "benchmarks/**/*.js", "example/**/*.js", "lib/**/*.js", "test/**/*.js"],
			coverage: ["coverage"]
		},

		_release: {
			options: {
				tagName: "v<%= version %>",
				commitMessage: "v<%= version %>"
			}
		},
		
		'string-replace': {
			packageDependencies: {
				files: { "_references.d.ts": "_references.d.ts" },
				options: {
					replacements: [{
						pattern: /(\/\/\/ <reference path="\.\/typings\/DefinitelyTyped\/tsd.d.ts" \/>)/gi,
						replacement: '//$1'
					}]
				}
			},
			developmentDependencies: {
				files: { "_references.d.ts": "_references.d.ts" },
				options: {
					replacements: [{
						pattern: /\/\/(\/\/\/ <reference path="\.\/typings\/DefinitelyTyped\/tsd.d.ts" \/>)/gi,
						replacement: '$1'
					}]
				}
			}
		}
	});
    
	grunt.event.on('coverage', function (lcovcontent, done) {
		require('coveralls').handleInput(lcovcontent, function (err) {
			if (err) return done(err);
			done();
		});
	});
	
    grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks("grunt-mocha-cli");
	grunt.loadNpmTasks("grunt-mocha-istanbul");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-release");
	grunt.loadNpmTasks("grunt-string-replace");
	
	grunt.renameTask('release', '_release');
	
    grunt.registerTask("default", ["clean", "ts:dev"]);
	grunt.registerTask("test", ["clean", "ts:test", "mochacli"]);
	grunt.registerTask("coverage", ["clean", "ts:test", "mocha_istanbul:coverage"]);
	grunt.registerTask("coveralls", ["clean", "ts:test", "mocha_istanbul:coveralls"]);
	grunt.registerTask("build", ["clean", "ts:release"]);
	grunt.registerTask("build:package", ["clean", "ts:release", "string-replace:packageDependencies"]);
	grunt.registerTask("clean:package", ["string-replace:developmentDependencies"]);
	
	grunt.registerTask("release", ["build:package", "_release", "clean:package"]);
	grunt.registerTask("release:prerelease", ["build:package", "_release:prerelease", "clean:package"]);
	grunt.registerTask("release:patch", ["build:package", "_release:patch", "clean:package"]);
	grunt.registerTask("release:minor", ["build:package", "_release:minor", "clean:package"]);
	grunt.registerTask("release:major", ["build:package", "_release:major", "clean:package"]);
};