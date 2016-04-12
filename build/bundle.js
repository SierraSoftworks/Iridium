var gulp    = require('gulp'),
    typings = require('typings-core'),
    path    = require('path');
    
var paths = require('./paths');
    
gulp.task('bundle', ['build'], function(cb) {
    typings.bundle({
        cwd: path.dirname(__dirname),
        out: paths.distFolder
    }).then(function () {
        return cb();
    }, function(err) {
        return cb(err);
    });
});