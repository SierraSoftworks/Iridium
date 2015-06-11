var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    spawn = require('child_process').spawn;

gulp.task('publish', function () {
    return runSequence('publish-prep', 'publish-action', 'publish-clean');
});

gulp.task('publish-prep', function () {
    return gulp.src('_references.d.ts')
        .pipe(replace(/^\/{3}.*tsd\.d\.ts.*$/, '//$0'))
        .pipe(gulp.dest('.'));
});

gulp.task('publish-action', function (done) {
    spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('publish-clean', function () {
    return gulp.src('_references.d.ts')
        .pipe(replace(/^\/{2}(\/{3}.*tsd\.d\.ts.*)$/, '$1'))
        .pipe(gulp.dest('.'));
});