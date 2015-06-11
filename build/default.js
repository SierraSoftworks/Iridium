var gulp = require('gulp'),
	runSequence = require('run-sequence');
	
gulp.task('default', function () {
	return runSequence('clean', 'build', 'test', 'watch');
});