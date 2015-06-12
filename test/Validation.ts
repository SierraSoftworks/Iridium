/// <reference path="../_references.d.ts" />
import * as Iridium from '../index';

interface Document {
    name: string;
    dateOfBirth: Date;
    siblings: {
        name: string;
        related: boolean;
        ageDifference: number;
    }[];
}

class Person extends Iridium.Instance<Document, Person> {
    static collection = 'test';
    static schema: Iridium.Schema = {
        _id: false,
        name: String,
        dateOfBirth: Date,
        siblings: [{
            name: String,
            related: Boolean,
            ageDifference: Number
        }]
    };
    
    name: string;
    dateOfBirth: Date;
    siblings: {
        name: string;
        related: boolean;
        ageDifference: number;
    }[];
}

describe("Validation", () => {
    let core = new Iridium.Core({ database: 'test' });
    let model = new Iridium.Model<Document, Person>(core, Person);

    before(() => core.connect());

    after(() => model.remove().then(() => core.close()));

    beforeEach(() => model.remove());

    describe("inserting", () => {
        it("should successfully validate single documents which match the schema", () => {
            return chai.expect(model.insert({
                name: 'John',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Jane',
                    related: true,
                    ageDifference: -2
                }]
            })).to.eventually.be.ok;
        });

        it("should fail to validate single documents which do not match the schema", () => {
            return chai.expect(model.insert({
                name: 'John',
                dateOfBirth: <any>0,
                siblings: [{
                    name: 'Jane',
                    related: true,
                    ageDifference: -2
                }]
            })).to.eventually.be.rejected;
        });

        it("should not insert a document into the database if it fails validation", () => {
            return model.insert({
                name: 'John',
                dateOfBirth: <any>0,
                siblings: [{
                    name: 'Jane',
                    related: true,
                    ageDifference: -2
                }]
            }).catch(() => chai.expect(model.findOne({ dateOfBirth: 0 })).to.eventually.be.null);
        });

        it("should successfully validate multiple documents which match the schema", () => {
            return chai.expect(model.insert([{
                name: 'Frank',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Francie',
                    related: false,
                    ageDifference: -2
                }]
            }, {
                name: 'Jack',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Jill',
                    related: true,
                    ageDifference: 2
                }]
            }])).to.eventually.be.ok;
        });

        it("should fail to validate multiple documents which do not match the schema", () => {
            return chai.expect(model.insert([{
                name: 'Frank',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Francie',
                    related: <any>'related',
                    ageDifference: -2
                }]
            }, {
                name: <any>5,
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Jill',
                    related: true,
                    ageDifference: 2
                }]
            }])).to.eventually.be.rejected;
        });

        it("should fail to validate multiple documents where some do not match the schema", () => {
            return chai.expect(model.insert([{
                name: 'Frank',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Francie',
                    related: <any>'related',
                    ageDifference: -2
                }]
            }, {
                name: 'Jack',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Jill',
                    related: true,
                    ageDifference: 2
                }]
            }])).to.eventually.be.rejected;
        });

        it("should fail to validate multiple documents where some do not match the schema", () => {
            return model.insert([{
                name: 'Frank',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Francie',
                    related: <any>'related',
                    ageDifference: -2
                }]
            }, {
                name: 'Jack',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Jill',
                    related: true,
                    ageDifference: 2
                }]
            }]).catch(() => chai.expect(model.findOne({ 'siblings.related': 'related' })).to.eventually.be.null);
        });
    });

    describe("instances", () => {
        beforeEach(() => model.remove().then(() => model.insert({
            name: 'Frank',
            dateOfBirth: new Date(),
            siblings: []
        })));

        it("should validate documents when you attempt to change them", () => {
            return chai.expect(model.get({ name: 'Frank' }).then((frank) => {
                frank.siblings.push({ name: 'Francette', related: true, ageDifference: 0 });
                return frank.save();
            })).to.eventually.be.ok;
        });

        it("should fail validation if the document does not match the schema", () => {
            return chai.expect(model.get({ name: 'Frank' }).then((frank) => {
                frank.siblings.push({ name: 'Francette', related: <any>'related', ageDifference: 0 });
                return frank.save();
            })).to.eventually.be.rejected;
        });

        it("should not change the document in the database if validation fails", () => {
            return chai.expect(model.get({ name: 'Frank' }).then((frank) => {
                frank.siblings.push({ name: 'Francette', related: <any>'related', ageDifference: 0 });
                return frank.save();
            }).catch(() => model.get({ name: 'Frank', 'siblings.related': 'related' }))).to.eventually.be.null;
        });

        it("should not reverse the changes made to the instance if validation fails", () => {
            let staticFrank: Person;
            return chai.expect(model.get({ name: 'Frank' }).then((frank) => {
                staticFrank = frank;
                frank.siblings.push({ name: 'Francette', related: <any>'related', ageDifference: 0 });
                return frank.save();
            }).catch(() => chai.expect(staticFrank).to.have.property('siblings').with.length(1))).to.eventually.be.ok;
        });
    });
});