var tsconfig = require('./tsconfig.json');

module.exports = function (grunt) {
	"use strict";
	
	grunt.initConfig({
		ts: {
			options: tsconfig.compilerOptions,
			
			dev: {
				src: tsconfig.files,
				reference: 'iridium.d.ts',
				watch: 'lib'
			},
			test: {
				src: tsconfig.files,
				reference: 'iridium.d.ts',
				options: {
					sourceMap: true
				}
			},
			release: {
				src: tsconfig.files,
				reference: 'iridium.d.ts',
				options: {
					sourceMap: false
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
					reportFormats: ['lcovonly'],
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
	
    grunt.registerTask("default", ["ts:dev"]);
	grunt.registerTask("test", ["ts:test", "mochacli"]);
	grunt.registerTask("coverage", ["ts:test", "mocha_istanbul:coverage"]);
	grunt.registerTask("coveralls", ["ts:test", "mocha_istanbul:coveralls"]);
	grunt.registerTask("release", ["ts:release"]);
};