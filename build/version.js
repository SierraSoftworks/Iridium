var gulp = require('gulp'),
	bump = require('gulp-bump'),
	gutil = require('gulp-util'),
	git = require('gulp-git'),
	minimist = require('minimist'),
    semver = require('semver'),
    runSequence = require('run-sequence');
	
var paths = require('./paths');

function getPackageJsonVersion() {
    //We parse the json file instead of using require because require caches multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
};

gulp.task('version-bump', function () {
    var args = minimist(process.argv);
    
    var ver = args._.pop();
    var options = {};
    if (semver.valid(ver)) options.version = ver;
    else options.type = ver;
    
    return gulp.src(['./package.json'])
        .pipe(bump(options).on('error', gutil.log))
        .pipe(gulp.dest('./'));
});

gulp.task('version-commit', function () {
    var version = getPackageJsonVersion();
    return gulp.src('.')
        .pipe(git.commit('Version ' + version, { args: '-a' }));
});

gulp.task('version-push', function (cb) {
    git.push('origin', 'master', cb);
});

gulp.task('version-tag', function (cb) {
    var version = getPackageJsonVersion();
    git.tag(version, 'Version ' + version, function (error) {
        if (error) {
            return cb(error);
        }
        git.push('origin', 'master', { args: '--tags' }, cb);
    });
});

gulp.task('version', function (callback) {
    runSequence(
        'version-bump',
        'version-commit',
        'version-push',
        'version-tag',
        function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('Version set and comitted successfully');
            }
            callback(error);
        });
});