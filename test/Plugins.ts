import Iridium = require('../index');
import Skmatc = require('skmatc');

describe("Plugins",() => {
    var core: Iridium.Core;
    beforeEach(() => {
        core = new Iridium.Core({ database: 'test' });
    });

    describe("newModel",() => {
        it("should allow a plugin not to define a handler",() => {
            core.register({
                newInstance: (instance, model) => { },
                validate: []
            });
        });

        it("should allow a plugin to define a handler",() => {
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => { },
                validate: []
            });
        });

        it("should be called when a new model is created",() => {
            var wasCalled = false;
            core.register({
                newModel: (model) => {
                    wasCalled = true;
                }
            });
            var model = new Iridium.Model<any, any>(core,(model, doc) => doc, 'test', { _id: false });
            chai.expect(wasCalled).to.be.true;
        });

        it("should be able to make modifications to the model",() => {
            core.register({
                newModel: (model) => {
                    model.collectionName = 'changed';
                }
            });

            var model = new Iridium.Model(core,(model, doc) => doc, 'test', { _id: false });
            chai.expect(model.collectionName).to.exist.and.be.equal('changed');
        });
    });

    describe("newInstance",() => {
        it("should allow a plugin not to define a handler",() => {
            core.register({
                newModel: (model) => { },
                validate: []
            });
        });

        it("should allow a plugin to define a handler",() => {
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => { },
                validate: []
            });
        });

        it("should be called when an instance is instantiated",() => {
            var wasCalled = false;
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => {
                    wasCalled = true;
                },
                validate: []
            });

            var model = new Iridium.Model(core, Iridium.Instance, 'test', { _id: false });
            var instance = new model.Instance({});
            chai.expect(wasCalled).to.be.true;
        });

        it("should not be called when the instance doesn't inherit from Iridium.Instance",() => {
            var wasCalled = false;
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => {
                    wasCalled = true;
                },
                validate: []
            });

            var model = new Iridium.Model(core, (model, doc) => doc, 'test', { _id: false });
            var instance = new model.Instance({});
            chai.expect(wasCalled).to.be.false;
        });
    });

    describe("validators",() => {
        it("should allow a plugin to not define validators",() => {
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => { }
            });
        });

        it("should allow a plugin to define a single validator",() => {
            core.register({
                newInstance: (instance, model) => { },
                validate: Skmatc.create((schema) => schema == 'Test', (schema, data) => this.assert(data == 'test'))
            });
        });

        it("should allow a plugin to define multiple validators",() => {
            core.register({
                newInstance: (instance, model) => { },
                validate: [Skmatc.create((schema) => schema == 'Test',(schema, data) => this.assert(data == 'test'))]
            });
        });
    });
});