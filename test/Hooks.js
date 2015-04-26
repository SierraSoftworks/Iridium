var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../_references.d.ts" />
var Iridium = require('../index');
var Events = require('events');
var Promise = require('bluebird');
var Test = (function (_super) {
    __extends(Test, _super);
    function Test() {
        _super.apply(this, arguments);
    }
    return Test;
})(Iridium.Instance);
var hookEmitter = new Events.EventEmitter();
describe("Hooks", function () {
    this.timeout(500);
    var core = new Iridium.Core({ database: 'test' });
    var model = new Iridium.Model(core, Test, 'test', {
        _id: false,
        answer: Number
    }, {
        hooks: {
            creating: function (document) { return hookEmitter.emit('creating', document); },
            ready: function (instance) { return hookEmitter.emit('ready', instance); },
            retrieved: function (document) { return hookEmitter.emit('retrieved', document); },
            saving: function (instance, changes) { return hookEmitter.emit('saving', instance, changes); }
        }
    });
    beforeEach(function () { return core.connect().then(function () { return model.remove(); }).then(function () { return model.insert({ answer: 10 }); }); });
    afterEach(function () { return model.remove(); });
    after(function () { return core.close(); });
    describe("creating", function () {
        it("should be called when a document is being created", function (done) {
            hookEmitter.once('creating', function () { return done(); });
            model.insert({ answer: 11 });
        });
        it("should be passed the document being created", function () {
            var result;
            hookEmitter.once('creating', function (document) {
                result = Promise.resolve().then(function () {
                    chai.expect(document).to.eql({ answer: 11 });
                });
            });
            return model.insert({ answer: 11 }).then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
    });
    describe("ready", function () {
        it("should be called when an instance is prepared", function () {
            var result;
            hookEmitter.once('ready', function () {
                result = Promise.resolve();
            });
            return model.get().then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
        it("should be passed the instance which was created", function () {
            var result;
            hookEmitter.once('ready', function (instance) {
                result = Promise.resolve().then(function () {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });
            return model.get().then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
    });
    describe("retreived", function () {
        it("should be called when a document is being retrieved", function () {
            var result;
            hookEmitter.once('retrieved', function () {
                result = Promise.resolve();
            });
            return model.get().then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
        it("should be passed the document being retrieved", function () {
            var result;
            hookEmitter.once('retrieved', function (document) {
                result = Promise.resolve().then(function () {
                    chai.expect(document).to.have.property('answer', 10);
                });
            });
            return model.get().then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
    });
    describe("saving", function () {
        it("should be triggered when save() is called on an instance", function () {
            var result;
            hookEmitter.once('saving', function () {
                result = Promise.resolve();
            });
            return model.get().then(function (instance) {
                instance.answer++;
                return instance.save();
            }).then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
        it("should be passed the instance being saved", function () {
            var result;
            hookEmitter.once('saving', function (instance) {
                result = Promise.resolve().then(function () {
                    chai.expect(instance).to.be.an.instanceof(model.Instance);
                });
            });
            return model.get().then(function (instance) {
                instance.answer++;
                return instance.save();
            }).then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
        it("should be passed the changes being made to the instance", function () {
            var result;
            hookEmitter.once('saving', function (instance, changes) {
                result = Promise.resolve().then(function () {
                    chai.expect(changes).to.eql({
                        $set: { answer: instance.answer }
                    });
                });
            });
            return model.get().then(function (instance) {
                instance.answer++;
                return instance.save();
            }).then(function () { return chai.expect(result).to.exist; }).then(function () { return result; });
        });
    });
});
//# sourceMappingURL=Hooks.js.map