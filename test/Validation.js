var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Person = (function (_super) {
    __extends(Person, _super);
    function Person() {
        _super.apply(this, arguments);
    }
    return Person;
})(Iridium.Instance);
describe("Validation", function () {
    var core = new Iridium.Core({ database: 'test' });
    var model = new Iridium.Model(core, Person, 'test', {
        name: String,
        dateOfBirth: Date,
        siblings: [{
            name: String,
            related: Boolean,
            ageDifference: Number
        }]
    });
    before(function () { return core.connect(); });
    after(function () { return model.remove().then(function () { return core.close(); }); });
    beforeEach(function () { return model.remove(); });
    describe("inserting", function () {
        it("should successfully validate single documents which match the schema", function () {
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
        it("should fail to validate single documents which do not match the schema", function () {
            return chai.expect(model.insert({
                name: 'John',
                dateOfBirth: 0,
                siblings: [{
                    name: 'Jane',
                    related: true,
                    ageDifference: -2
                }]
            })).to.eventually.be.rejected;
        });
        it("should not insert a document into the database if it fails validation", function () {
            return model.insert({
                name: 'John',
                dateOfBirth: 0,
                siblings: [{
                    name: 'Jane',
                    related: true,
                    ageDifference: -2
                }]
            }).catch(function () { return chai.expect(model.findOne({ dateOfBirth: 0 })).to.eventually.be.null; });
        });
        it("should successfully validate multiple documents which match the schema", function () {
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
        it("should fail to validate multiple documents which do not match the schema", function () {
            return chai.expect(model.insert([{
                name: 'Frank',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Francie',
                    related: 'related',
                    ageDifference: -2
                }]
            }, {
                name: 5,
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Jill',
                    related: true,
                    ageDifference: 2
                }]
            }])).to.eventually.be.rejected;
        });
        it("should fail to validate multiple documents where some do not match the schema", function () {
            return chai.expect(model.insert([{
                name: 'Frank',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Francie',
                    related: 'related',
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
        it("should fail to validate multiple documents where some do not match the schema", function () {
            return model.insert([{
                name: 'Frank',
                dateOfBirth: new Date(),
                siblings: [{
                    name: 'Francie',
                    related: 'related',
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
            }]).catch(function () { return chai.expect(model.findOne({ 'siblings.related': 'related' })).to.eventually.be.null; });
        });
    });
    describe("instances", function () {
        beforeEach(function () { return model.remove().then(function () { return model.insert({
            name: 'Frank',
            dateOfBirth: new Date(),
            siblings: []
        }); }); });
        it("should validate documents when you attempt to change them", function () {
            return chai.expect(model.get({ name: 'Frank' }).then(function (frank) {
                frank.siblings.push({ name: 'Francette', related: true, ageDifference: 0 });
                return frank.save();
            })).to.eventually.be.ok;
        });
        it("should fail validation if the document does not match the schema", function () {
            return chai.expect(model.get({ name: 'Frank' }).then(function (frank) {
                frank.siblings.push({ name: 'Francette', related: 'related', ageDifference: 0 });
                return frank.save();
            })).to.eventually.be.rejected;
        });
        it("should not change the document in the database if validation fails", function () {
            return chai.expect(model.get({ name: 'Frank' }).then(function (frank) {
                frank.siblings.push({ name: 'Francette', related: 'related', ageDifference: 0 });
                return frank.save();
            }).catch(function () { return model.get({ name: 'Frank', 'siblings.related': 'related' }); })).to.eventually.be.null;
        });
        it("should not reverse the changes made to the instance if validation fails", function () {
            var staticFrank;
            return chai.expect(model.get({ name: 'Frank' }).then(function (frank) {
                staticFrank = frank;
                frank.siblings.push({ name: 'Francette', related: 'related', ageDifference: 0 });
                return frank.save();
            }).catch(function () { return chai.expect(staticFrank).to.have.property('siblings').with.length(1); })).to.eventually.be.ok;
        });
    });
});
//# sourceMappingURL=Validation.js.map