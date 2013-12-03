(require.modules || {}).preprocessor = module.exports = PreprocessorBase;

function PreprocessorBase() {
	/// <summary>Base structure for a preprocessor</summary>

}

PreprocessorBase.prototype.toSource = function(object) {
	/// <summary>Transforms the given object into the source format</summary>
	/// <param name="object" type="Object">The object to transform</summary>
};

PreprocessorBase.prototype.toLocal = PreprocessorBase.prototype.fromSource = function(object) {
	/// <summary>Transforms the given object into the destination format</summary>
	/// <param name="object" type="Object">The object to transform</summary>
};