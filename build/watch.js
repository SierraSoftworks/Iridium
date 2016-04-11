var gulp = require('gulp');
var runSequence = require('run-sequence');
var paths = require('./paths.js');

gulp.task('watch', function () {
    gulp.watch(paths.watchFiles, function () {
        return runSequence('build', 'test');
    });
});