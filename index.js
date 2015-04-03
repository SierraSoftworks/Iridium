/// <reference path="./lib/Core.ts" />
/// <reference path="./lib/Model.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Core = require('./lib/Core');
var Model = require('./lib/Model');
var Iridium = (function (_super) {
    __extends(Iridium, _super);
    function Iridium() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Iridium, "Model", {
        get: function () {
            return Model.Model;
        },
        enumerable: true,
        configurable: true
    });
    return Iridium;
})(Core);
module.exports = Iridium;
//# sourceMappingURL=index.js.map