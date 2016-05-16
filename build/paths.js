var path = require('path');
module.exports = {
	distFolder: path.resolve(__dirname, '../dist'),
	projectRoot: path.dirname(__dirname),
	coverageFolder: path.resolve(__dirname, '../coverage'),

	watchFiles: ["lib/**/*.ts", "index.ts", "test/**/*.ts"],
	cleanFiles: ["coverage", "dist"],

	builtTestFiles: 'dist/test/*.js',
	builtFiles: ["dist/lib/**/*.js", "dist/index.js"],

	docSourceFiles: [
		"typings/index.d.ts",
		"iridium.ts"
	],
	testSupportFiles: ['dist/test/support/chai']
};