var _this = this;
var Iridium = require('../index');
var Skmatc = require('skmatc');
describe("Plugins", function () {
    var core;
    beforeEach(function () {
        core = new Iridium.Core({ database: 'test' });
    });
    describe("newModel", function () {
        it("should allow a plugin not to define a handler", function () {
            core.register({
                newInstance: function (instance, model) { },
                validate: []
            });
        });
        it("should allow a plugin to define a handler", function () {
            core.register({
                newModel: function (model) { },
                newInstance: function (instance, model) { },
                validate: []
            });
        });
        it("should be called when a new model is created", function () {
            var wasCalled = false;
            core.register({
                newModel: function (model) {
                    wasCalled = true;
                }
            });
            var model = new Iridium.Model(core, function (model, doc) { return doc; }, 'test', { _id: false });
            chai.expect(wasCalled).to.be.true;
        });
        it("should be able to make modifications to the model", function () {
            core.register({
                newModel: function (model) {
                    model.collectionName = 'changed';
                }
            });
            var model = new Iridium.Model(core, function (model, doc) { return doc; }, 'test', { _id: false });
            chai.expect(model.collectionName).to.exist.and.be.equal('changed');
        });
    });
    describe("newInstance", function () {
        it("should allow a plugin not to define a handler", function () {
            core.register({
                newModel: function (model) { },
                validate: []
            });
        });
        it("should allow a plugin to define a handler", function () {
            core.register({
                newModel: function (model) { },
                newInstance: function (instance, model) { },
                validate: []
            });
        });
        it("should be called when an instance is instantiated", function () {
            var wasCalled = false;
            core.register({
                newModel: function (model) { },
                newInstance: function (instance, model) {
                    wasCalled = true;
                },
                validate: []
            });
            var model = new Iridium.Model(core, Iridium.Instance, 'test', { _id: false });
            var instance = new model.Instance({});
            chai.expect(wasCalled).to.be.true;
        });
        it("should not be called when the instance doesn't inherit from Iridium.Instance", function () {
            var wasCalled = false;
            core.register({
                newModel: function (model) { },
                newInstance: function (instance, model) {
                    wasCalled = true;
                },
                validate: []
            });
            var model = new Iridium.Model(core, function (model, doc) { return doc; }, 'test', { _id: false });
            var instance = new model.Instance({});
            chai.expect(wasCalled).to.be.false;
        });
    });
    describe("validators", function () {
        it("should allow a plugin to not define validators", function () {
            core.register({
                newModel: function (model) { },
                newInstance: function (instance, model) { }
            });
        });
        it("should allow a plugin to define a single validator", function () {
            core.register({
                newInstance: function (instance, model) { },
                validate: Skmatc.create(function (schema) { return schema == 'Test'; }, function (schema, data) { return _this.assert(data == 'test'); })
            });
        });
        it("should allow a plugin to define multiple validators", function () {
            core.register({
                newInstance: function (instance, model) { },
                validate: [Skmatc.create(function (schema) { return schema == 'Test'; }, function (schema, data) { return _this.assert(data == 'test'); })]
            });
        });
    });
});
//# sourceMappingURL=Plugins.js.map