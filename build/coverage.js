var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	istanbul = require('gulp-istanbul'),
	mocha = require('gulp-mocha'),
	path = require('path');
	
var paths = require('./paths');

gulp.task('coverage', function (cb) {
	gulp.src(paths.builtFiles)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function () {
			gulp.src(paths.builtTestFiles)
				.pipe(plumber())
				.pipe(mocha({
					require: paths.testSupportFiles.map(function (file) { return path.resolve(path.dirname(__dirname), file); }),
					timeout: 10000
				}))
				.pipe(istanbul.writeReports({
					dir: paths.coverageFolder,
					reporters: ['lcov', 'json', 'html'],
					reportOpts: { dir: paths.coverageFolder }
				}))
				.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
				.once('end', function () { cb(); process.exit(); })
				.once('error', function (err) { cb(err); process.exit(1); });
	});
});
	