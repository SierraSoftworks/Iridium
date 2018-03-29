import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import * as Events from "events";
import * as chai from "chai";

import {DefaultTransforms} from "../lib/Transforms";

let hookEmitter = new Events.EventEmitter();

interface Document {
	_id?: string | MongoDB.ObjectId;
    name: string;
	email: string;
	avatar: Buffer | MongoDB.Binary;
	
	lastModified?: Date;
}

class Person extends Iridium.Instance<Document, Person> {
    static collection = "test";
    static schema: Iridium.Schema = {
		_id: false,
        name: String,
		email: String,
		avatar: Buffer
    };

	static transforms: Iridium.Transforms = {
		$document: {
			fromDB: x => x,
			toDB: x => {
				x.lastModified = new Date();
				return x;
			}
		},
		email: {
			fromDB: x => x.toUpperCase(),
			toDB: x => x.toLowerCase().trim()
		}
	};

	@Iridium.ObjectID
	_id: string;
    name: string;
	email: string;
	@Iridium.Binary
	avatar: Buffer;

	static onCreating(document: Document) {
        hookEmitter.emit("creating", document);
    }

    static onReady(instance: Person) {
        hookEmitter.emit("ready", instance);
    }

    static onRetrieved(document: Document) {
        hookEmitter.emit("retrieved", document);
    }

    static onSaving(instance: Person, changes: any) {
        hookEmitter.emit("saving", instance, changes);
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
		chai.expect(db.Person).to.have.property("schema").with.property("_id", MongoDB.ObjectID);
	});

	it("should include a sensible default for the _id field transform", () => {
		chai.expect(db.Person).to.have.property("transforms").with.property("_id");
	});

	describe("during creation", () => {
		describe("with a basic insertion document", () => {
			it("should apply field transforms", () => {
				return db.Person.insert({
					name: "Test User",
					email: "Test@email.com",
					avatar: new Buffer(0)
				}).then(user => {
					chai.expect(user).to.exist.and.have.property("email", "TEST@EMAIL.COM");
				});
			});
		});

		describe("with a complex insertion object", () => {
			it("should not apply field transforms", () => {
				const person = {
					toDB() {
						return {
							name: "Test User",
							email: "test@email.com",
							avatar: Iridium.toBinary(new Buffer(0))
						}
					}
				}

				return db.Person.insert(person).then(user => {
					chai.expect(user).to.exist;
					chai.expect(user.document).to.have.property("email", "test@email.com");
				});
			});
		});

		describe("ordering", () => {
			before(() => {
				db.Person.schema["email"] = /^test@email.com$/;
			});
			
			after(() => {
				db.Person.schema["email"] = String;
			});

			it("should only be applied after onCreating", () => {
				let onCreatingCalled = false;
				hookEmitter.once("creating", (doc: Document) => {
					onCreatingCalled = true;
					chai.expect(doc.email).to.eql("Test@email.com");
					chai.expect(doc.lastModified).to.not.exist;
				});

				return db.Person.insert({
					name: "Test User",
					email: "Test@email.com",
					avatar: new Buffer(0)
				}).then(user => {
					chai.expect(onCreatingCalled).to.be.true;
					chai.expect(user).to.exist;
					chai.expect(user).to.have.property("document").with.property("lastModified");
					chai.expect(user.document.lastModified!.valueOf()).to.be.closeTo(new Date().valueOf(), 1000);
				});
			});

			it("should be applied before validation", () => {
				return db.Person.insert({
					name: "Test User",
					email: "Test@email.com",
					avatar: new Buffer(0)
				});
			});
		});
	});

	describe("with an instance", () => {
		beforeEach(() => db.Person.insert({
			name: "Test User",
			email: "test@email.com",
			avatar: new Buffer("test", "utf8")
		}));

		it("should apply the transform on property reads", () => {
			return db.Person.get().then(person => {
				chai.expect(person).to.exist
				chai.expect(person.email).to.eql("TEST@EMAIL.COM");
				chai.expect(person.document.email).to.eql("test@email.com");
			});
		});

		it("should apply the transform on property writes", () => {
			return db.Person.get().then(person => {
				chai.expect(person).to.exist
				person.email = "Test@email.com";
				chai.expect(person.email).to.eql("TEST@EMAIL.COM");
				chai.expect(person.document.email).to.eql("test@email.com");
			});
		});
		
		it("should apply the $document transform on saves", () => {
			let onSavingCalled = false;
			hookEmitter.once("saving", (doc: Document) => {
				onSavingCalled = true;
				chai.expect(doc.lastModified).to.not.exist;
			});
			
			return db.Person.get().then(person => {
				return person.save();
			}).then(person => {
				chai.expect(person).to.exist;
				chai.expect(person).to.have.property("document").with.property("lastModified");
				chai.expect(person.document.lastModified!.valueOf()).to.be.closeTo(new Date().valueOf(), 1000);
				chai.expect(onSavingCalled).to.be.true;
			});
		});

		it("should diff the transformed property", () => {
			let changesChecked = false;
			hookEmitter.once("saving", (instance: Person, changes: Iridium.Changes) => {
				chai.expect(changes).to.have.property("$set").with.property("name", "Testy User");
				changesChecked = true;
			});

			return db.Person.get().then(person => {
				chai.expect(person.name).to.eql("Test User");
				person.name = "Testy User";
				person.email = "Test@email.com";
				chai.expect(person.email).to.eql("TEST@EMAIL.COM");
				chai.expect(person.document.email).to.eql("test@email.com");

				return person.save();
			}).then(person => {
				chai.expect(person).to.have.property("email", "TEST@EMAIL.COM");
				chai.expect(changesChecked).to.be.true;
			});
		});

		it("should diff the transformed document", () => {
			let changesChecked = false;
			hookEmitter.once("saving", (instance: Person, changes: Iridium.Changes) => {
				chai.expect(changes).to.have.property("$set").with.property("lastModified").which.is.instanceof(Date);
				changesChecked = true;
			});

			return db.Person.get().then(person => person.save()).then(person => {
				chai.expect(person).to.have.property("email", "TEST@EMAIL.COM");
				chai.expect(changesChecked).to.be.true;
			});
		});

		describe("the default ObjectID transform", () => {
			it("should return a string", () => {
				return db.Person.get().then(person => {
					chai.expect(person._id).to.be.a("string");
					chai.expect(person.document._id).to.be.a("object");
				});
			});

			it("should convert a string to an ObjectID", () => {
				return db.Person.get().then(person => {
					person._id = "aaaaaaaaaaaaaaaaaaaaaaaa";
					chai.expect(person._id).to.eql("aaaaaaaaaaaaaaaaaaaaaaaa");
					chai.expect(person.document._id).to.be.a("object");
				});
			});
		});

		describe("the default Buffer transform", () => {
			it("should convert a MongoDB BSON Binary object into a buffer", () => {
				let transform = DefaultTransforms.Binary.fromDB;
				let result = transform(new MongoDB.Binary(new Buffer("test", "utf8")), "_id", <any>null);
				
				chai.expect(result).to.exist;
				chai.expect(result.toString("utf8")).to.eql("test");
			});
			
			it("should convert the buffer into a MongoDB.Binary object", () => {
				let transform = DefaultTransforms.Binary.toDB;
				let buffer = new Buffer("test", "utf8");
				let result = transform(buffer, "_id", <any>null);
				
				chai.expect(result).to.be.instanceOf(MongoDB.Binary);
			});
			
			it("should return a buffer", () => {
				return db.Person.get().then(person => {
					chai.expect(Buffer.isBuffer(person.avatar)).to.be.true;
					chai.expect(person.document.avatar).to.be.a("object");
				});
			});

			it("should convert a buffer to a MongoDB.Binary", () => {
				return db.Person.get().then(person => {
					person.avatar = new Buffer("new", "utf8");
					chai.expect(Buffer.isBuffer(person.avatar)).to.be.true;
					chai.expect(person.avatar.toString("utf8")).to.eql("new");
					chai.expect(person.document.avatar).to.be.instanceof(MongoDB.Binary)
				});
			});
		});
	});
});