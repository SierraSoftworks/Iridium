var gulp = require('gulp'),
    replace = require('gulp-replace');

gulp.task('prepublish', function () {
    return gulp.src(['_references.d.ts'])
        .pipe(replace(/^(\/{3}\s*<[^>]*tsd\.d\.ts[^>]*\/>)/g, '//$1'))
        .pipe(gulp.dest('.'));
});

gulp.task('postpublish', function () {
    return gulp.src('_references.d.ts')
        .pipe(replace(/^\/{2}(\/{3}\s*<[^>]*tsd\.d\.ts[^>]*\/>)/ig, '$1'))
        .pipe(gulp.dest('.'));
});