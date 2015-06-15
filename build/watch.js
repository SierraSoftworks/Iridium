var gulp = require('gulp');
var runSequence = require('run-sequence');
var paths = require('./paths.js');

gulp.task('watch', function () {
    gulp.watch(paths.buildFiles, function () {
        return runSequence('build-lib', 'test');
    });

    gulp.watch(paths.testFiles, function () {
        return runSequence('build-tests', 'test');
    });
});