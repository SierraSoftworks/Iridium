var path = require('path');
module.exports = {
	distFolder: path.resolve(__dirname, '../dist'),
	projectRoot: path.dirname(__dirname),
	coverageFolder: path.resolve(__dirname, '../coverage'),
	
	buildFiles: ["lib/**/*.ts", "index.ts"],
	testFiles: ["test/**/*.ts"],
	cleanFiles: ["coverage", "dist"],
	
	builtTestFiles: 'dist/test/*.js',
	builtFiles: ["dist/lib/**/*.js", "dist/index.js"],
	testSupportFiles: ['dist/test/support/chai'],
	
	docSourceFiles: [
		"index.ts"
		// "lib/Core.ts",
		// "lib/Model.ts",
		// "lib/Instance.ts",
		// "lib/Instance.ts"
	]
};