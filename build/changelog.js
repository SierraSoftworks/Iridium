var gulp = require('gulp'),
	util = require('gulp-util'),
	git = require('gulp-git'),
	replace = require('gulp-replace'),
	path = require('path');
	
var repo = require('../package.json').repository.url;
	
gulp.task('changelog', function(done) {
	git.exec({ args: 'log --oneline --decorate' }, function(err, stdout) {
		if(err) return done(err);
		return done(null, gulp.src('CHANGELOG.md')
			.pipe(replace(/.|\n/g, ''))
			.pipe(replace(/$/, stdout))
			.pipe(replace(/#(\d+)/, '[#$1](' + repo + '/issues/$1)'))
			.pipe(replace(/([a-f0-9]{7}) \(HEAD[^)]*\) (.+)/g, function(_, sha, comment) {
				return '\n## [Working Changes](' + repo + ')' +
					'\n- [' + sha + '](' + repo + '/commit/' + sha + ') ' + comment;
			}))
			.pipe(replace(/([a-f0-9]{7}) \(tag: ([^\s),]*)[^)]*\) (.+)/g, function(_, sha, tag, comment) {
				var niceTag = tag;
				if(tag.indexOf('v') !== 0) niceTag = 'v' + tag;
				return '\n## [' + niceTag + '](' + repo + '/tree/' + tag + ')' +
					'\n- [' + sha + '](' + repo + '/commit/' + sha + ') ' + comment;
			}))
			.pipe(replace(/([a-f0-9]{7}) (.+)/g, '- [$1](' + repo + '/commit/$1) $2'))
			.pipe(gulp.dest('.')));
	});
});

gulp.task('changelog-commit', function () {
    return gulp.src('CHANGELOG.md')
		.pipe(git.add())
        .pipe(git.commit('Updated CHANGELOG'));
});