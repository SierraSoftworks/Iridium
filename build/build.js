var gulp       = require('gulp'),
	typescript = require('gulp-typescript'),
	sourcemaps = require('gulp-sourcemaps'),
	plumber    = require('gulp-plumber'),
	changed    = require('gulp-changed');
	
var paths = require('./paths');
	
var tsProject = {
	module: 'commonjs',
	target: 'es5',
	typescript: require('typescript')
};

gulp.task('build', ['build-lib', 'build-tests']);

gulp.task('build-lib', function () {
	var tsResult = gulp.src(paths.buildFiles, { base: paths.projectRoot })
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(typescript(tsProject));
		
	return tsResult.js
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.distFolder));
});

gulp.task('build-tests', function () {
	var tsResult = gulp.src(paths.testFiles, { base: paths.projectRoot })
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(typescript(tsProject));
		
	return tsResult.js
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.distFolder));
});