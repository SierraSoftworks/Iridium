import * as Iridium from "../../iridium";
import * as chai from "chai";

interface TestDocument {
    _id?: string;
    metadata: any;
}

@Iridium.Collection("test")
@Iridium.Transform(doc => {
    if (doc.metadata && typeof doc.metadata === "string")
        doc.metadata = JSON.parse(doc.metadata);
    return doc;
}, doc => {
    if (doc.metadata && typeof doc.metadata === "object")
        doc.metadata = JSON.stringify(doc.metadata);
    return doc
})
class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    @Iridium.ObjectID
    _id: string;

    @Iridium.Property(true)
    metadata: any;
}

describe("issues", () => {
    let core = new Iridium.Core({ database: "test" });
    before(() => core.connect());
    after(() => core.close());

    describe("#73", () => {
        let model = new Iridium.Model<TestDocument, Test>(core, Test);
        beforeEach(() => model.remove());
        beforeEach(() => model.insert([
            { metadata: { test: 1 } },
            { metadata: { test: 2 } },
            { metadata: { test: 3 } },
        ]));

        it("should persist metadata as a string", () => {
            return model.collection.find({}).toArray().then(docs => {
                return chai.expect(docs.map(c => c.metadata)).to.eql([
                    "{\"test\":1}",
                    "{\"test\":2}",
                    "{\"test\":3}"
                ]);
            });
        });
        
        it("map should apply document transforms", () => {
            return chai.expect(model.find().map(c => c.metadata)).to.eventually.eql([
                { test: 1 },
                { test: 2 },
                { test: 3 },
            ]);
        });
    });
});