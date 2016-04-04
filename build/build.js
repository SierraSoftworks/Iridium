var gulp       = require('gulp'),
	typescript = require('gulp-typescript'),
	sourcemaps = require('gulp-sourcemaps');

var paths = require('./paths');

var tsProjectLib = typescript.createProject('tsconfig.json', {
	typescript: require('typescript')
});

var tsProjectTest = typescript.createProject('tsconfig.json', {
	typescript: require('typescript')
});

gulp.task('build', ['build-lib', 'build-tests']);

function build(files, project) {
	var tsResult = gulp.src(files, { base: paths.projectRoot })
		.pipe(sourcemaps.init())
		.pipe(typescript(project));

	return tsResult.js
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.distFolder));
}

gulp.task('build-lib', function () {
	return build(paths.buildFiles, tsProjectLib);
});

gulp.task('build-tests', function () {
	return build(paths.testFiles, tsProjectTest);
});