var gulp       = require('gulp'),
	typescript = require('gulp-typescript'),
	sourcemaps = require('gulp-sourcemaps'),
    merge      = require('merge2');

var paths = require('./paths');

var tsProject = typescript.createProject('tsconfig.json', {
	typescript: require('typescript'),
    sortOutput: true
});

gulp.task('build', function() {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

	return merge([
        tsResult.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(paths.distFolder)),
        tsResult.dts
            .pipe(gulp.dest(paths.distFolder))
    ]);
});