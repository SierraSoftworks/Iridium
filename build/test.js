var gulp = require('gulp'),
	mocha = require('gulp-mocha'),
	plumber = require('gulp-plumber'),
	path = require('path');

var paths = require('./paths');

gulp.task('test', function () {
	return gulp.src(paths.builtTestFiles)
		.pipe(mocha({
			require: paths.testSupportFiles.map(function (file) { return path.resolve(path.dirname(__dirname), file); }),
			timeout: 10000
		}));
});