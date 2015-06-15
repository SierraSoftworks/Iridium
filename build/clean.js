var gulp = require('gulp');
var del = require('del');

var paths = require('./paths');

gulp.task('clean', function (done) {
	del(paths.cleanFiles, done);
});