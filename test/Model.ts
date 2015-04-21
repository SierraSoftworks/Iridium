import Iridium = require('../index');

interface TestDocument {
    id?: string;
    answer: number;
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    id: string;
    answer: number;
}

describe("Model",() => {
    var core = new Iridium.Core({ database: 'test' });

    describe("constructor",() => {
        it("should throw an error if you don't provide a valid core",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(null,() => { }, 'test', { id: String })
            }).to.throw("You failed to provide a valid Iridium core for this model");
        });

        it("should throw an error if you don't provide a valid instanceType",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core, null, 'test', { id: String })
            }).to.throw("You failed to provide a valid instance constructor for this model");
        });

        it("should throw an error if you don't provide a collection name",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, null, { id: String })
            }).to.throw("You failed to provide a valid collection name for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, '', { id: String })
            }).to.throw("You failed to provide a valid collection name for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, <any>4, { id: String })
            }).to.throw("You failed to provide a valid collection name for this model");
        });

        it("should throw an error if you don't provide a valid schema",() => {
            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, 'test', null)
            }).to.throw("You failed to provide a valid schema for this model");

            chai.expect(() => {
                new Iridium.Model<any, any>(core,() => { }, 'test', {})
            }).to.throw("You failed to provide a valid schema for this model");
        });

        it("should correctly set the core",() => {
            chai.expect(new Iridium.Model(core,() => { }, 'test', { id: String }).core).to.equal(core);
        });

        it("should correctly set the collectionName",() => {
            chai.expect(new Iridium.Model(core,() => { }, 'test', { id: String }).collectionName).to.equal('test');
        });

        it("should correctly set the schema",() => {
            chai.expect(new Iridium.Model(core,() => { }, 'test', { id: String }).schema).to.eql({ id: String });
        });
    });

    describe("create",() => {
        var model = new Iridium.Model<TestDocument, Test>(core, Test, 'test', { answer: Number });

        before(() => {
            return core.connect()
        });
        
        it("should allow the insertion of a single document",() => {
            return chai.expect(model.create({ answer: 10 })).to.eventually.exist.and.have.property('answer', 10);
        });
        
        it("should allow the insertion of multiple documents",() => {
            return chai.expect(model.create([
                { answer: 11 },
                { answer: 12 },
                { answer: 13 }
            ])).to.eventually.exist.and.have.lengthOf(3);
        });

        it("should allow you to provide options to control the creation",() => {
            return chai.expect(model.create({ answer: 14 }, { w: 'majority' })).to.eventually.exist;
        });
    });
});