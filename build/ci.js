var gulp = require('gulp');
var runSequence = require('run-sequence');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var path = require('path');

var paths = require('./paths');

gulp.task('ci', function () {
	return runSequence('postpublish','build', 'ci-test');
});

gulp.task('ci-test', function () {
	return gulp.src(paths.builtTestFiles)
		.pipe(plumber())
		.pipe(mocha({
			require: paths.testSupportFiles.map(function (file) { return path.resolve(path.dirname(__dirname), file); }),
			timeout: 10000
		}))
		.once('end', function () { process.exit(); })
		.once('error', function () { process.exit(1); });
});