"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
const MongoDB = require("mongodb");
const chai = require("chai");
let Person = class Person extends Iridium.Instance {
};
Person.collection = "test";
Person.schema = {
    _id: MongoDB.ObjectID,
    name: String,
    dateOfBirth: "Over18",
    siblings: [{
            name: String,
            related: Boolean,
            ageDifference: Number
        }],
    avatar: MongoDB.Binary
};
__decorate([
    Iridium.ObjectID
], Person.prototype, "_id", void 0);
__decorate([
    Iridium.Binary
], Person.prototype, "avatar", void 0);
Person = __decorate([
    Iridium.Validate("Over18", function (schema, data) {
        return this.assert(data.getTime && data.getTime() < (new Date().getTime() - 365 * 86400 * 18 * 1000));
    })
], Person);
describe("Validation", () => {
    let core = new Iridium.Core({ database: "test" });
    let model = new Iridium.Model(core, Person);
    before(() => core.connect());
    after(() => model.remove().then(() => core.close()));
    beforeEach(() => model.remove());
    describe("custom validators", () => {
        it("should successfully validate documents which are valid", () => {
            return chai.expect(model.insert({
                name: "John",
                dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                siblings: [{
                        name: "Jane",
                        related: true,
                        ageDifference: -2
                    }],
                avatar: new Buffer("test", "utf8")
            })).to.eventually.be.ok;
        });
        it("should fail to validate documents which are invalid", () => {
            return chai.expect(model.insert({
                name: "John",
                dateOfBirth: new Date("2013-02-14T00:00:00.000Z"),
                siblings: [{
                        name: "Jane",
                        related: true,
                        ageDifference: -2
                    }],
                avatar: new Buffer("test", "utf8")
            })).to.eventually.be.rejected;
        });
        describe("ObjectID", () => {
            it("should successfully validate valid documents", () => {
                return chai.expect(model.insert({
                    _id: "012345670123456701234567",
                    name: "John",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Jane",
                            related: true,
                            ageDifference: -2
                        }],
                    avatar: new Buffer("test", "utf8")
                })).to.eventually.be.ok;
            });
            it("should fail to validate documents which are invalid", () => {
                return chai.expect(model.insert({
                    _id: "this is an invalid id",
                    name: "John",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Jane",
                            related: true,
                            ageDifference: -2
                        }],
                    avatar: new Buffer("test", "utf8")
                })).to.eventually.be.rejected;
            });
        });
        describe("Binary", () => {
            it("should successfully validate valid documents", () => {
                return chai.expect(model.insert({
                    name: "John",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Jane",
                            related: true,
                            ageDifference: -2
                        }],
                    avatar: new Buffer("test", "utf8")
                })).to.eventually.be.ok;
            });
            it("should fail to validate documents which are invalid", () => {
                return chai.expect(model.insert({
                    name: "John",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Jane",
                            related: true,
                            ageDifference: -2
                        }],
                    avatar: "test"
                })).to.eventually.be.rejected;
            });
        });
    });
    describe("inserting", () => {
        it("should successfully validate single documents which match the schema", () => {
            return chai.expect(model.insert({
                name: "John",
                dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                siblings: [{
                        name: "Jane",
                        related: true,
                        ageDifference: -2
                    }],
                avatar: new Buffer("test", "utf8")
            })).to.eventually.be.ok;
        });
        it("should fail to validate single documents which do not match the schema", () => {
            return chai.expect(model.insert({
                name: "John",
                dateOfBirth: 0,
                siblings: [{
                        name: "Jane",
                        related: true,
                        ageDifference: -2
                    }],
                avatar: new Buffer("test", "utf8")
            })).to.eventually.be.rejected;
        });
        it("should not insert a document into the database if it fails validation", () => {
            return model.insert({
                name: "John",
                dateOfBirth: 0,
                siblings: [{
                        name: "Jane",
                        related: true,
                        ageDifference: -2
                    }],
                avatar: new Buffer("test", "utf8")
            }).catch(() => chai.expect(model.findOne({ dateOfBirth: 0 })).to.eventually.be.null);
        });
        it("should successfully validate multiple documents which match the schema", () => {
            return chai.expect(model.insert([{
                    name: "Frank",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Francie",
                            related: false,
                            ageDifference: -2
                        }],
                    avatar: new Buffer("test", "utf8")
                }, {
                    name: "Jack",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Jill",
                            related: true,
                            ageDifference: 2
                        }],
                    avatar: new Buffer("test", "utf8")
                }])).to.eventually.be.ok;
        });
        it("should fail to validate multiple documents which do not match the schema", () => {
            return chai.expect(model.insert([{
                    name: "Frank",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Francie",
                            related: "related",
                            ageDifference: -2
                        }],
                    avatar: new Buffer("test", "utf8")
                }, {
                    name: 5,
                    dateOfBirth: new Date(),
                    siblings: [{
                            name: "Jill",
                            related: true,
                            ageDifference: 2
                        }],
                    avatar: new Buffer("test", "utf8")
                }])).to.eventually.be.rejected;
        });
        it("should fail to validate multiple documents where some do not match the schema", () => {
            return chai.expect(model.insert([{
                    name: "Frank",
                    dateOfBirth: new Date(),
                    siblings: [{
                            name: "Francie",
                            related: "related",
                            ageDifference: -2
                        }],
                    avatar: new Buffer("test", "utf8")
                }, {
                    name: "Jack",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Jill",
                            related: true,
                            ageDifference: 2
                        }],
                    avatar: new Buffer("test", "utf8")
                }])).to.eventually.be.rejected;
        });
        it("should fail to validate multiple documents where some do not match the schema", () => {
            return model.insert([{
                    name: "Frank",
                    dateOfBirth: new Date(),
                    siblings: [{
                            name: "Francie",
                            related: "related",
                            ageDifference: -2
                        }],
                    avatar: new Buffer("test", "utf8")
                }, {
                    name: "Jack",
                    dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
                    siblings: [{
                            name: "Jill",
                            related: true,
                            ageDifference: 2
                        }],
                    avatar: new Buffer("test", "utf8")
                }]).catch(() => chai.expect(model.findOne({ "siblings.related": "related" })).to.eventually.be.null);
        });
    });
    describe("instances", () => {
        beforeEach(() => model.remove().then(() => model.insert({
            name: "Frank",
            dateOfBirth: new Date("1993-02-14T00:00:00.000Z"),
            siblings: [],
            avatar: new Buffer("test", "utf8")
        })));
        it("should validate documents when you attempt to change them", () => {
            return chai.expect(model.get({ name: "Frank" }).then((frank) => {
                frank.siblings.push({ name: "Francette", related: true, ageDifference: 0 });
                return frank.save();
            })).to.eventually.be.ok;
        });
        it("should fail validation if the document does not match the schema", () => {
            return chai.expect(model.get({ name: "Frank" }).then((frank) => {
                frank.siblings.push({ name: "Francette", related: "related", ageDifference: 0 });
                return frank.save();
            })).to.eventually.be.rejected;
        });
        it("should not change the document in the database if validation fails", () => {
            return chai.expect(model.get({ name: "Frank" }).then((frank) => {
                frank.siblings.push({ name: "Francette", related: "related", ageDifference: 0 });
                return frank.save();
            }).catch(() => model.get({ name: "Frank", "siblings.related": "related" }))).to.eventually.be.null;
        });
        it("should not reverse the changes made to the instance if validation fails", () => {
            let staticFrank;
            return chai.expect(model.get({ name: "Frank" }).then((frank) => {
                staticFrank = frank;
                frank.siblings.push({ name: "Francette", related: "related", ageDifference: 0 });
                return frank.save();
            }).catch(() => chai.expect(staticFrank).to.have.property("siblings").with.length(1))).to.eventually.be.ok;
        });
    });
});
//# sourceMappingURL=Validation.js.map