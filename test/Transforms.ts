/// <reference path="../typings/DefinitelyTyped/tsd.d.ts" />
import * as Iridium from '../index';
import MongoDB = require('mongodb');
import Events = require('events');

let hookEmitter = new Events.EventEmitter();

interface Document {
	_id?: string;
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
			fromDB: x => x.toUpperCase(),
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
				chai.expect(user).to.exist.and.have.property('email', 'TEST@EMAIL.COM');
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

	describe("with an instance", () => {
		beforeEach(() => db.Person.insert({
			name: 'Test User',
			email: 'test@email.com'
		}));

		it("should apply the transform on property reads", () => {
			return db.Person.get().then(person => {
				chai.expect(person.email).to.eql('TEST@EMAIL.COM');
				chai.expect(person.document.email).to.eql('test@email.com');
			});
		});

		it("should apply the transform on property writes", () => {
			return db.Person.get().then(person => {
				person.email = 'Test@email.com';
				chai.expect(person.email).to.eql('TEST@EMAIL.COM');
				chai.expect(person.document.email).to.eql('test@email.com');
			});
		});

		it("should diff the transformed property", () => {
			let changesChecked = false;
			hookEmitter.once('saving', (instance, changes) => {
				chai.expect(changes).to.eql({ $set: { name: 'Testy User' }});
				changesChecked = true;
			});

			return db.Person.get().then(person => {
				person.name = 'Testy User';
				person.email = 'Test@email.com';
				chai.expect(person.email).to.eql('TEST@EMAIL.COM');
				chai.expect(person.document.email).to.eql('test@email.com');

				return person.save();
			}).then(person => {
				chai.expect(person).to.have.property('email', 'TEST@EMAIL.COM');
				chai.expect(changesChecked).to.be.true;
			});
		});

		describe("the default ObjectID transform", () => {
			it("should return a string", () => {
				return db.Person.get().then(person => {
					chai.expect(person._id).to.be.a('string');
					chai.expect(person.document._id).to.be.a('object');
				});
			});

			it("should convert a string to an ObjectID", () => {
				return db.Person.get().then(person => {
					person._id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
					chai.expect(person._id).to.eql('aaaaaaaaaaaaaaaaaaaaaaaa');
					chai.expect(person.document._id).to.be.a('object');
				});
			});
		});
	});
});