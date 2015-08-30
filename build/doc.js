var gulp = require('gulp'),
	git = require('gulp-git'),
	typedoc = require('gulp-typedoc'),
	path = require('path'),
	runSequence = require('run-sequence'),
	fs = require('fs');
	
var paths = require('./paths');
	
gulp.task('doc', function() {
	return runSequence('doc-compile', 'doc-submodule', 'doc-commit');
});
	
gulp.task('doc-submodule', function(cb) {
	fs.writeFile('doc/.git', 'gitdir: ../.git/modules/doc', cb);
});

gulp.task('doc-commit', function(cb) {
	git.exec({ args: 'diff-files', quiet: true, cwd: 'doc' }, function(err, stdout) {
		if(err && err.code === 1) runSequence('doc-commit-changes', 'doc-commit-newdocs', 'doc-push', cb);
		else cb();
	});
});

gulp.task('doc-commit-changes', function() {
	return gulp.src('.', { cwd: 'doc' })
		.pipe(git.commit('Updated documentation', { options: '--quiet', cwd: 'doc', quiet: true }));
});
	
gulp.task('doc-commit-newdocs', function() {
	return gulp.src('.')
		.pipe(git.commit('Updated documentation', { options: '--quiet', quiet: true }));
});
	
gulp.task('doc-push', function(cb) {
	git.push('origin', 'gh-pages', { cwd: 'doc' }, cb);
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