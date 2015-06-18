/// <reference path="../_references.d.ts" />
import * as Iridium from '../index';
import MongoDB = require('mongodb');
import Events = require('events');

let hookEmitter = new Events.EventEmitter();

interface Document {
    name: string;
	email: string;
}

class Person extends Iridium.Instance<Document, Person> {
    static collection = 'test';
    static schema: Iridium.Schema = {
		_id: false,
        name: String,
		email: String
    };
	
	static transforms: Iridium.Transforms = {
		email: {
			fromDB: x => x,
			toDB: x => x.toLowerCase().trim()
		}
	};
    
	_id: string;
    name: string;
	email: string;
	
	static onCreating(document: Document) {
        hookEmitter.emit('creating', document);
    }
    
    static onReady(instance: Person) {
        hookEmitter.emit('ready', instance);
    }
    
    static onRetrieved(document: Document) {
        hookEmitter.emit('retrieved', document);
    }
    
    static onSaving(instance: Person, changes: any) {
        hookEmitter.emit('saving', instance, changes);
    }
}

class TestDB extends Iridium.Core {
    constructor() {
        super("mongodb://localhost/test");
    }

    Person = new Iridium.Model<Document, Person>(this, Person);
}

describe("Transforms", () => {
	var db = new TestDB();
	
	before(() => db.connect());
	beforeEach(() => db.Person.remove());
	after(() => db.close());
	
	it("should include a sensible default for the _id field schema", () => {
		chai.expect(db.Person).to.have.property('schema').with.property('_id', MongoDB.ObjectID);
	});
	
	it("should include a sensible default for the _id field transform", () => {
		chai.expect(db.Person).to.have.property('transforms').with.property('_id');
	});
	
	describe("during creation", () => {
		it("should be applied", () => {
			return db.Person.insert({
				name: 'Test User',
				email: 'Test@email.com'
			}).then(user => {
				chai.expect(user).to.exist.and.have.property('email', 'test@email.com');
			});
		});
		
		it("should only be applied after onCreating", () => {
			let onCreatingCalled = false;
			hookEmitter.once('creating', (doc) => {
				onCreatingCalled = true;
				chai.expect(doc.email).to.eql('Test@email.com');
			});
			
			return db.Person.insert({
				name: 'Test User',
				email: 'Test@email.com'
			}).then(() => {
				chai.expect(onCreatingCalled).to.be.true;
			});
		});
		
		it("should be applied before validation", () => {
			db.Person.schema['email'] = /^test@email.com$/;
			return db.Person.insert({
				name: 'Test User',
				email: 'Test@email.com'
			});
		});
	});
});