(require.modules || {}).preprocessors = module.exports = {
	Rename: require('./rename'),
	Convert: require('./conversion')
};