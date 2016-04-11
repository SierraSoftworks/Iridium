var gulp       = require('gulp'),
	typescript = require('gulp-typescript'),
	sourcemaps = require('gulp-sourcemaps');

var paths = require('./paths');

var tsProject = typescript.createProject('tsconfig.json', {
	typescript: require('typescript')
});

gulp.task('build', function() {
    var tsResult = tsProject.src()
        .pipe(typescript(tsProject));

	return tsResult.js
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.distFolder));
});