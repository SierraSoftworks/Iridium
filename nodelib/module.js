
var Module = function () {
    this.exports = new Object();
    this.require = function (id) {
        /// <param name='id' type='String' />
        /// <returns type='Object' />
        return new Object();
    };
    this.id = new String();
    this.filename = new String();
    this.loaded = new Boolean();
    this.parent = new Object();
    this.children = new Object();
}