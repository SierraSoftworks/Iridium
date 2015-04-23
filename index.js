/// <reference path="./_references.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _Core = require('./lib/Core');
var _Model = require('./lib/Model');
var _Instance = require('./lib/Instance');
var Iridium;
(function (Iridium) {
    var Core = (function (_super) {
        __extends(Core, _super);
        function Core() {
            _super.apply(this, arguments);
        }
        return Core;
    })(_Core);
    Iridium.Core = Core;
    ;
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model() {
            _super.apply(this, arguments);
        }
        return Model;
    })(_Model.Model);
    Iridium.Model = Model;
    ;
    var Instance = (function (_super) {
        __extends(Instance, _super);
        function Instance() {
            _super.apply(this, arguments);
        }
        return Instance;
    })(_Instance);
    Iridium.Instance = Instance;
    ;
    ;
})(Iridium || (Iridium = {}));
;
module.exports = Iridium;
//# sourceMappingURL=index.js.map