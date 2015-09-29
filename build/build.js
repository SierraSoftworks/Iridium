var gulp       = require('gulp'),
	typescript = require('gulp-typescript'),
	sourcemaps = require('gulp-sourcemaps');
	
var paths = require('./paths');
	
var tsProject = {
	module: 'commonjs',
	target: 'es5',
	typescript: require('typescript'),
	experimentalDecorators: true
};

gulp.task('build', ['build-lib', 'build-tests']);

function build(files) {
	var tsResult = gulp.src(files, { base: paths.projectRoot })
		.pipe(sourcemaps.init())
		.pipe(typescript(tsProject));
		
	return tsResult.js
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.distFolder));
}

gulp.task('build-lib', function () {
	return build(paths.buildFiles);
});

gulp.task('build-tests', function () {
	return build(paths.testFiles);
});