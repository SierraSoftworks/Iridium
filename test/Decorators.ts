/// <reference path="../_references.d.ts" />
import * as Iridium from '../index';
import 'reflect-metadata';
import skmatc = require('skmatc');
import MongoDB = require('mongodb');

interface TestDocument {
	_id?: string;
	name: string;
	email: string;
}

function VersionValidator(schema, data) {
    return this.assert(/^\d+\.\d+\.\d+(?:-.+)?$/.test(data));
}

@Iridium.Collection('test')
@Iridium.Index({ name: 1 })
@Iridium.Index({ email: 1 }, { background: true })
@Iridium.Validate('version', VersionValidator)
@Iridium.Property('version', 'version')    
class Test extends Iridium.Instance<TestDocument, Test> implements TestDocument {
	@Iridium.ObjectID
	_id: string;
	
	@Iridium.Property(String)
	name: string;
		
    @Iridium.Property(/^.+@.+$/)
	@Iridium.Transform(email => email.toLowerCase().trim(), email => email.toLowerCase().trim())
	email: string;
	
	version: string;
}

describe("Decorators", () => {
    describe("Collection", () => {
        it("should populate the collection static field", () => {
            chai.expect(Test.collection).to.equal('test');
        });
		
        it("should not pollute the parent's collection property", () => {
            chai.expect(Iridium.Instance.collection).to.not.exist;
        });
    });
	
	describe("Index", () => {
		it("should populate the constructor's indexes property with index objects", () => {
			chai.expect(Test.indexes).to.exist.and.have.length(2);
		});
		
		it("should support just spec indexes", () => {
            chai.expect(Test.indexes).to.containOneLike({ spec: { name: 1 }, options: {} });
		});
		
		it("should support indexes with both a spec and options", () => {
			chai.expect(Test.indexes).to.containOneLike({ spec: { email: 1 }, options: { background: true }});
		});
		
        it("should not pollute the parent's index object", () => {
            chai.expect(Iridium.Instance.indexes).to.exist.and.have.length(0);
        });
	});
	
	describe("Validate", () => {
		it("should populate the constructor's valdiators property", () => {
			chai.expect(Test.validators).to.exist.and.have.length(Iridium.Instance.validators.length + 1);
		});
		
		it("should create a valid Skmatc validator instance", () => {
            let s = new skmatc(Test.schema);
			
            for (let i = 0; i < Test.validators.length; i++) {
                chai.expect(Test.validators[i]).to.be.a('function');
                s.register(Test.validators[i]);
            }
			
            chai.expect(s.validate({
				name: 'Test',
				email: 'test@test.com',
                version: '1.0.0'
           	})).to.exist.and.have.property('failures').eql([]);
        });
		
		it("should correctly include the validations", () => {
            let s = new skmatc(Test.schema);
			
            for (let i = 0; i < Test.validators.length; i++) {
                chai.expect(Test.validators[i]).to.be.a('function');
                s.register(Test.validators[i]);
            }
			
            chai.expect(s.validate({
				name: 'Test',
				email: 'test@test.com',
                version: 'a1.0.0'
           	})).to.exist.and.have.property('failures').not.eql([]);
		});
		
        it("should not pollute the parent's validators object", () => {
            chai.expect(Iridium.Instance.validators).to.exist.and.have.length(1);
        });
	});
	
	describe("ObjectID", () => {
		it("should populate the constructor's schema object", () => {
			chai.expect(Test.schema).to.exist.and.have.property('_id').and.eql({ $required: false, $type: /^[0-9a-f]{24}$/ });
		});
		
		it("should populate the constructor's identifier object", () => {
			chai.expect(Test.identifier).to.exist.and.have.property('apply').which.is.a('function');
			chai.expect(Test.identifier).to.exist.and.have.property('reverse').which.is.a('function');
		});
	});
	
	describe("Property", () => {
		it("should populate the constructor's schema object when applied to properties", () => {
			chai.expect(Test.schema).to.exist.and.have.property('name', String);
			chai.expect(Test.schema).to.exist.and.have.property('email').and.eql(/^.+@.+$/);
        });
		
		it("should populate the constructor's schema object when to the constructor", () => {
			chai.expect(Test.schema).to.exist.and.have.property('version', 'version');
		});
	});
    describe("Transform", () => {
        it("should not remove existing entries in the transforms object", () => {
            chai.expect(Test.transforms).to.exist.and.have.property('_id').with.property('fromDB').which.is.a('function');
			chai.expect(Test.transforms).to.exist.and.have.property('_id').with.property('toDB').which.is.a('function');
        });
		
        it("should populate the constructor's transforms object", () => {
            chai.expect(Test.transforms).to.exist.and.have.property('email').with.property('fromDB').which.is.a('function');
			chai.expect(Test.transforms).to.exist.and.have.property('email').with.property('toDB').which.is.a('function');
        });
		
        it("should not pollute the parent's transforms object", () => {
            chai.expect(Iridium.Instance.transforms).to.exist.and.not.have.property('email');
        });
    });
});