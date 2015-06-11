/// <reference path="../_references.d.ts" />
import * as Iridium from '../index';

interface TestDocument {
	_id?: string;
	name: string;
	email: string;
}

@Iridium.Identifier(x => x / 10, x => x * 10)
@Iridium.Index({ name: 1 })
@Iridium.Index({ email: 1 }, { background: true })
class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
	
	@Iridium.ObjectID
	get _id(): string { return this.document._id; }
	set _id(value: string) { this.document._id = value; }
	
	@Iridium.Property name: string;
	@Iridium.Property email: string;
}

describe("Decorators", () => {
	describe("Index", () => {
		it("should populate the constructor's indexes property with index objects", () => {
			chai.expect(Test.indexes).to.exist.and.have.length(2);
		});
		
		it("should support just spec indexes", () => {
			chai.expect(Test.indexes).to.containOneLike({ spec: { name: 1 } });
		});
		
		it("should support indexes with both a spec and options", () => {
			chai.expect(Test.indexes).to.containOneLike({ spec: { email: 1 }, options: { background: true }});
		});
	});
	
	describe("Identifier", () => {
		it("should populate the constructor's identifier object", () => {
			chai.expect(Test.identifier).to.exist.and.have.property('apply').which.is.a('function');
			chai.expect(Test.identifier).to.exist.and.have.property('reverse').which.is.a('function');
		});
		
		it("should pass along the correct functions", () => {
			chai.expect(Test.identifier.apply(10)).to.eql(1);
			chai.expect(Test.identifier.reverse(10)).to.eql(100);
		});
	});
});