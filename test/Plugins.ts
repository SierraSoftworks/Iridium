import * as Iridium from "../iridium";
import * as Skmatc from "skmatc";
import * as chai from "chai";

class Test extends Iridium.Instance<any, Test> {
    static collection = "test";
    static schema: Iridium.Schema = {
        _id: false
    };

    _id: string;
}

describe("Plugins",() => {
    let core: Iridium.Core;
    beforeEach(async () => {
        core = new Iridium.Core({ database: "test" });
        await core.connect();
    });

    after(async () => {
        await core.db.dropCollection("test");
        await core.db.dropCollection("apartments");
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
            let wasCalled = false;
            core.register({
                newModel: (model) => {
                    wasCalled = true;
                }
            });
            let model = new Iridium.Model<any, Test>(core, Test);
            chai.expect(wasCalled).to.be.true;
        });

        it("should be able to make modifications to the model",() => {
            core.register({
                newModel: (model) => {
                    model.collectionName = "changed";
                }
            });

            let model = new Iridium.Model<any, Test>(core, Test);
            chai.expect(model.collectionName).to.exist.and.be.equal("changed");
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
            let wasCalled = false;
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => {
                    wasCalled = true;
                },
                validate: []
            });

            let model = new Iridium.Model<any, Test>(core, Test);
            let instance = new model.Instance({});
            chai.expect(wasCalled).to.be.true;
        });

        it("should not be called when the instance doesn't inherit from Iridium.Instance",() => {
            let wasCalled = false;
            core.register({
                newModel: (model) => { },
                newInstance: (instance, model) => {
                    wasCalled = true;
                },
                validate: []
            });

            let instanceImplementation: any = function() { return {}; };
            instanceImplementation.collection = "test";
            instanceImplementation.schema = {
                _id: false
            };

            let model = new Iridium.Model(core, instanceImplementation);
            let instance = new model.Instance({});
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
                validate: Skmatc.create((schema) => schema == "Test", function (schema, data) { return this.assert(data == "test") })
            });
        });

        it("should allow a plugin to define multiple validators",() => {
            core.register({
                newInstance: (instance, model) => { },
                validate: [Skmatc.create((schema) => schema == "Test", function (schema, data) { return this.assert(data == "test") })]
            });
        });

        it("should actually use a plugin's validator array to validate a document", async () => {
            class Apartment extends Iridium.Instance<any, Apartment> {
                static collection = "apartments";
                static schema: Iridium.Schema = {
                    _id: false
                };

                @Iridium.Property("Kittens")
                public kittens: string[];
            
                _id: string;
            }
            
            let wasCalled = false;

            core.register({
                validate: [Skmatc.create((schema) => schema == "Kittens", function (schema, data) {
                    wasCalled = true;
                    return this.assert(data.length >= 1, "Kittens are mandatory! Must have at least 1.");
                })]
            });

            const apartmentModel = new Iridium.Model(core, Apartment);
            const apartment = new apartmentModel.Instance({ kittens: ['Sweety']});

            await apartment.save();

            chai.expect(wasCalled).to.be.true;
        });

        it("should actually use a plugin's single validator object to validate a document", async () => {
            class Apartment extends Iridium.Instance<any, Apartment> {
                static collection = "apartments";
                static schema: Iridium.Schema = {
                    _id: false
                };

                @Iridium.Property("Cats")
                public kittens: string[];
            
                _id: string;
            }
            
            let wasCalled = false;

            core.register({
                validate: Skmatc.create((schema) => schema == "Cats", function (schema, data) {
                    wasCalled = true;
                    return this.assert(data.length >= 1, "Cats are mandatory! Must have at least 1.");
                })
            });

            const apartmentModel = new Iridium.Model(core, Apartment);
            const apartment = new apartmentModel.Instance({ kittens: ['Sweety']});

            await apartment.save();

            chai.expect(wasCalled).to.be.true;
        });
    });
});