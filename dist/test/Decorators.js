"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../iridium");
const skmatc = require("skmatc");
const MongoDB = require("mongodb");
const Validators_1 = require("../lib/Validators");
const chai = require("chai");
let Test = class Test extends Iridium.Instance {
};
Test.transforms = {};
Test.indexes = [];
__decorate([
    Iridium.ObjectID
], Test.prototype, "_id", void 0);
__decorate([
    Iridium.Property(String)
], Test.prototype, "name", void 0);
__decorate([
    Iridium.Property(/^.+@.+$/),
    Iridium.Transform(email => email.toLowerCase().trim(), email => email.toLowerCase().trim())
], Test.prototype, "email", void 0);
__decorate([
    Iridium.Property(Boolean, false)
], Test.prototype, "optional1", void 0);
Test = __decorate([
    Iridium.Collection("test"),
    Iridium.Index({ name: 1 }),
    Iridium.Index({ email: 1 }, { background: true }),
    Iridium.Validate("version", function (schema, data) {
        return this.assert(/^\d+\.\d+\.\d+(?:-.+)?$/.test(data));
    }),
    Iridium.Property("version", "version"),
    Iridium.Property("optional2", Boolean, false),
    Iridium.Transform(doc => doc, doc => doc)
], Test);
describe("Decorators", () => {
    describe("Collection", () => {
        it("should populate the collection static field", () => {
            chai.expect(Test.collection).to.equal("test");
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
            chai.expect(Test.indexes).to.deep.include({ spec: { name: 1 }, options: {} });
        });
        it("should support indexes with both a spec and options", () => {
            chai.expect(Test.indexes).to.deep.include({ spec: { email: 1 }, options: { background: true } });
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
            let s = skmatc.scope(Test.schema);
            for (let i = 0; i < Test.validators.length; i++) {
                chai.expect(Test.validators[i]).to.be.a("function");
                s.register(Test.validators[i]);
            }
            chai.expect(s.validate({
                name: "Test",
                email: "test@test.com",
                version: "1.0.0"
            })).to.exist.and.have.property("failures").eql([]);
        });
        it("should correctly include the validations", () => {
            let s = skmatc.scope(Test.schema);
            for (let i = 0; i < Test.validators.length; i++) {
                chai.expect(Test.validators[i]).to.be.a("function");
                s.register(Test.validators[i]);
            }
            chai.expect(s.validate({
                name: "Test",
                email: "test@test.com",
                version: "a1.0.0"
            })).to.exist.and.have.property("failures").not.eql([]);
        });
        it("should not pollute the parent's validators object", () => {
            chai.expect(Iridium.Instance.validators).to.exist.and.have.length(Validators_1.DefaultValidators().length);
        });
    });
    describe("ObjectID", () => {
        it("should populate the constructor's schema object", () => {
            chai.expect(Test.schema).to.exist.and.have.property("_id").and.eql(MongoDB.ObjectID);
        });
        it("should populate the constructor's transforms object", () => {
            chai.expect(Test.transforms).to.exist.and.have.property("_id").with.property("fromDB").which.is.a("function");
            chai.expect(Test.transforms).to.exist.and.have.property("_id").with.property("toDB").which.is.a("function");
        });
        describe("the ObjectID transform", () => {
            it("should convert an ObjectID to a string", () => {
                chai.expect(Test.transforms["_id"].fromDB(Iridium.toObjectID("aaaaaaaaaaaaaaaaaaaaaaaa"), "_id", null)).to.eql("aaaaaaaaaaaaaaaaaaaaaaaa");
            });
            it("should convert a string to an ObjectID", () => {
                chai.expect(Test.transforms["_id"].toDB("aaaaaaaaaaaaaaaaaaaaaaaa", "_id", null)).to.be.instanceOf(MongoDB.ObjectID);
            });
            it("should handle undefined values correctly", () => {
                chai.expect(Test.transforms["_id"].toDB(undefined, "_id", null)).to.not.exist;
                chai.expect(Test.transforms["_id"].fromDB(undefined, "_id", null)).to.not.exist;
            });
        });
    });
    describe("Property", () => {
        it("should populate the constructor's schema object when applied to properties", () => {
            chai.expect(Test.schema).to.exist.and.have.property("name", String);
            chai.expect(Test.schema).to.exist.and.have.property("email").and.eql(/^.+@.+$/);
        });
        it("should populate the constructor's schema object when to the constructor", () => {
            chai.expect(Test.schema).to.exist.and.have.property("version", "version");
        });
        it("should correctly handle optional properties defined on instance fields", () => {
            chai.expect(Test.schema).to.exist.and.have.property("optional1").eql({ $required: false, $type: Boolean });
        });
        it("should correctly handle optional properties defined on the constructor", () => {
            chai.expect(Test.schema).to.exist.and.have.property("optional2").eql({ $required: false, $type: Boolean });
        });
        it("should not pollute the parent's schema object", () => {
            chai.expect(Iridium.Instance.schema).to.exist.and.not.have.property("name");
            chai.expect(Iridium.Instance.schema).to.exist.and.not.have.property("email");
            chai.expect(Iridium.Instance.schema).to.exist.and.not.have.property("version");
            chai.expect(Iridium.Instance.schema).to.exist.and.not.have.property("optional1");
            chai.expect(Iridium.Instance.schema).to.exist.and.not.have.property("optional2");
        });
    });
    describe("Transform", () => {
        describe("on a property", () => {
            it("should not remove existing entries in the transforms object", () => {
                chai.expect(Test.transforms).to.exist.and.have.property("_id").with.property("fromDB").which.is.a("function");
                chai.expect(Test.transforms).to.exist.and.have.property("_id").with.property("toDB").which.is.a("function");
            });
            it("should populate the constructor's transforms object", () => {
                chai.expect(Test.transforms).to.exist.and.have.property("email").with.property("fromDB").which.is.a("function");
                chai.expect(Test.transforms).to.exist.and.have.property("email").with.property("toDB").which.is.a("function");
            });
            it("should not pollute the parent's transforms object", () => {
                chai.expect(Iridium.Instance.transforms).to.exist.and.not.have.property("email");
            });
        });
        describe("on a class", () => {
            it("should not remove existing entries in the transforms object", () => {
                chai.expect(Test.transforms).to.exist.and.have.property("_id").with.property("fromDB").which.is.a("function");
                chai.expect(Test.transforms).to.exist.and.have.property("_id").with.property("toDB").which.is.a("function");
            });
            it("should populate the constructor's transforms object", () => {
                chai.expect(Test.transforms).to.exist.and.have.property("$document").with.property("fromDB").which.is.a("function");
                chai.expect(Test.transforms).to.exist.and.have.property("$document").with.property("toDB").which.is.a("function");
            });
            it("should not pollute the parent's transforms object", () => {
                chai.expect(Iridium.Instance.transforms).to.exist.and.not.have.property("$document");
            });
        });
    });
});
//# sourceMappingURL=Decorators.js.map