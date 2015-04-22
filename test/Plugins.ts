import Iridium = require('../index');

describe("Plugins",() => {
    var core = new Iridium.Core({ database: 'test' });

    it("should be registered with an Iridium Core",() => {
        core.register({
            newModel: (model) => {

            },
            newInstance: (instance, model) => {

            },
            validate: []
        });
    });

    describe("newModel",() => {
        it("should allow a plugin to define a handler",() => {
            core.register({
                newModel: (model) => {
                    model.collectionName = 'changed';
                },
                newInstance: (instance, model) => { },
                validate: []
            });
        });
        it("should allow a plugin not to define a handler",() => {
            core.register({
                newInstance: (instance, model) => { },
                validate: []
            });
        });
        it.skip("should be called when a new model is created",() => {
            var model = new Iridium.Model(core,() => { }, 'test', { id: false });
            chai.expect(model.collectionName).to.exist.and.equal('changed');
        });
    });

    describe("newInstance",() => {
        it("should allow a plugin not to define a handler");
        it("should be called when a new instance is created");
    });

    describe("validators",() => {
        it("should make schema validators available for models");
        it("should allow a plugin to not define any schema validators");
    });
});