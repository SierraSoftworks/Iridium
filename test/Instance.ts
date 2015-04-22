/// <reference path="../_references.d.ts" />
import Iridium = require('../index');

interface TestDocument {
    id: string;
    answer: number;
}

class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
    id: string;
    answer: number;

    test() {
        return true;
    }

    get ansqr() {
        return this.answer * this.answer;
    }
}

class TestDB extends Iridium.Core {
    constructor() {
        super("mongodb://localhost/test");
    }

    Test = new Iridium.Model<TestDocument, Test>(this, Test, 'test', { id: false, answer: Number });
}

describe("Instance",() => {
    var core = new TestDB();

    before(() => core.connect());
    after(() => core.close());

    it("should expose the latest document values",() => {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.answer).to.be.equal(2);
        chai.expect(instance.id).to.be.equal('aaaaaa');
    });

    describe("methods",() => {
        it("should expose save()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).save).to.exist.and.be.a('function');
        });

        it("should expose update()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).update).to.exist.and.be.a('function');
        });

        it("should expose refresh()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).refresh).to.exist.and.be.a('function');
        });

        it("should expose delete()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).delete).to.exist.and.be.a('function');
        });

        it("should expose remove()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).remove).to.exist.and.be.a('function');
        });

        it("should override toJSON()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toJSON()).to.eql({ id: '1', answer: 2 });
        });

        it("should override toString()",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).toString()).to.eql(JSON.stringify({ id: '1', answer: 2 }, null, 2));
        });
    });

    describe("properties",() => {
        it("should expose document",() => {
            chai.expect(core.Test.helpers.wrapDocument({ id: '1', answer: 2 }).document).to.eql({ id: '1', answer: 2 });
        });
    });
    
    it("should expose additional getters and setters",() => {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.ansqr).to.exist.and.be.equal(4);
    });

    it("should expose additional methods",() => {
        var instance = core.Test.helpers.wrapDocument({
            id: 'aaaaaa',
            answer: 2
        });

        chai.expect(instance).to.exist;
        chai.expect(instance.test).to.exist.and.be.a('function');
    });
});