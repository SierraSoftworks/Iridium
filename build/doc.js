var gulp = require('gulp'),
	typedoc = require('gulp-typedoc');
	
var paths = require('./paths');
	
gulp.task('doc', function() {
	return gulp.src(paths.docSourceFiles).pipe(typedoc({
		module: 'commonjs',
		target: 'es5',
		mode: 'modules',
		entryPoint: 'iridium',
		
		out: './doc',
		
		name: "Iridium",
		plugin: ['decorator'],
		ignoreCompilerErrors: true,
		version: true
	}));
});