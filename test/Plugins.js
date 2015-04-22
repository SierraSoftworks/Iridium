var Iridium = require('../index');
describe("Plugins", function () {
    var core = new Iridium.Core({ database: 'test' });
    it("should be registered with an Iridium Core", function () {
        core.register({
            newModel: function (model) {
            },
            newInstance: function (instance, model) {
            },
            validate: []
        });
    });
    describe("newModel", function () {
        it("should allow a plugin to define a handler", function () {
            core.register({
                newModel: function (model) {
                    model.collectionName = 'changed';
                },
                newInstance: function (instance, model) {
                },
                validate: []
            });
        });
        it("should allow a plugin not to define a handler", function () {
            core.register({
                newInstance: function (instance, model) {
                },
                validate: []
            });
        });
        it.skip("should be called when a new model is created", function () {
            var model = new Iridium.Model(core, function () {
            }, 'test', { id: false });
            chai.expect(model.collectionName).to.exist.and.equal('changed');
        });
    });
    describe("newInstance", function () {
        it("should allow a plugin not to define a handler");
        it("should be called when a new instance is created");
    });
    describe("validators", function () {
        it("should make schema validators available for models");
        it("should allow a plugin to not define any schema validators");
    });
});
//# sourceMappingURL=Plugins.js.map