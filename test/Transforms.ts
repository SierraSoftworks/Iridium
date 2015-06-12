/// <reference path="../_references.d.ts" />
import * as Iridium from '../index';

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
    
    name: string;
	email: string;
}

describe("Transforms", () => {
	describe("should be applied", () => {
		it("when creating a new object");
		it("when creating a new object, after onCreating");
		it("when creating a new object, before validation");
	});
});