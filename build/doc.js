var gulp = require('gulp'),
	git = require('gulp-git'),
	typedoc = require('gulp-typedoc'),
	path = require('path'),
	runSequence = require('run-sequence'),
	fs = require('fs');
	
var paths = require('./paths');
	
gulp.task('doc', function() {
	return runSequence('doc-build', 'doc-publish');
});
	
gulp.task('doc-build', function() {
	return runSequence('doc-checkout', 'doc-compile', ['doc-submodule', 'doc-attributes']);
});
	
gulp.task('doc-checkout', function(cb) {
	return git.checkout('gh-pages', { cwd: 'doc', quiet: true }, cb);
});
	
gulp.task('doc-submodule', function(cb) {
	fs.writeFile('doc/.git', 'gitdir: ../.git/modules/doc', cb);
});
	
gulp.task('doc-attributes', function(cb) {
	fs.writeFile('doc/.gitattributes', '* text=auto', cb);
});

gulp.task('doc-publish', function(cb) {
	git.exec({ args: 'diff-files --quiet', quiet: true, cwd: 'doc' }, function(err, stdout) {
		if(err && err.code === 1) runSequence('doc-commit', 'doc-update-ref', 'doc-push', cb);
		else cb();
	});
});

gulp.task('doc-commit', function() {
	return gulp.src('**', { cwd: 'doc' })
		.pipe(git.commit('Updated documentation', { cwd: 'doc' }));
});
	
gulp.task('doc-update-ref', function() {
	return gulp.src('.')
		.pipe(git.commit('Updated documentation'));
});
	
gulp.task('doc-push', function(cb) {
	git.push('origin', 'gh-pages', cb);
});
	
gulp.task('doc-compile', function() {
	return gulp.src(paths.docSourceFiles).pipe(typedoc({
		module: 'commonjs',
		target: 'es5',
		mode: 'file',
		entryPoint: 'iridium',
		
		out: './doc',
		
		name: "Iridium",
		plugin: ['decorator'],
		ignoreCompilerErrors: false
	}));
});