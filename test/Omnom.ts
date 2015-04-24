/// <reference path="../_references.d.ts" />
import Omnom = require('../lib/utils/Omnom');
import MongoDB = require('mongodb');

describe("Omnom",() => {
    it("should correctly diff basic objects",() => {
        var oldObject = {
            a: 1,
            b: 'test',
            c: 2,
            d: 'constant',
            e: 'old'
        };

        var newObject = {
            a: 3,
            b: 'tested',
            c: 2,
            d: 'constant',
            f: 'new'
        };

        var expectedDiff = {
            $set: { a: 3, b: 'tested', f: 'new' },
            $unset: { e: 1 }
        };

        chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
    });

    it("should correctly diff basic objects with atomic number changes",() => {
        var oldObject = {
            a: 1,
            b: 'test',
            c: 2,
            d: 'constant',
            e: 'old'
        };

        var newObject = {
            a: 3,
            b: 'tested',
            c: 2,
            d: 'constant',
            f: 'new'
        };

        var expectedDiff = {
            $set: { b: 'tested', f: 'new' },
            $inc: { a: 2 },
            $unset: { e: 1 }
        };

        chai.expect(Omnom.diff(oldObject, newObject, { atomicNumbers: true })).to.exist.and.be.eql(expectedDiff);
    });

    it('should correctly diff complex objects', function () {
        var oldObject = {
            a: { value: 1 },
            b: { value1: 1, value2: 1 },
            c: { value: 2 },
            d: { value: {} },
            e: { value: true }
        };

        var newObject = {
            a: { value: 3 },
            b: { value1: 'tested', value2: 2 },
            c: { value: 2 },
            d: { value: {} },
            e: { value2: false }
        };

        var expectedDiff = {
            $set: { 'a.value': 3, 'b.value1': 'tested', 'b.value2': 2, 'e.value2': false },
            $unset: { 'e.value': 1 }
        };

        chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
    });

    it('should correctly diff ObjectIDs', function () {
        var oldID = new MongoDB.ObjectID();
        var newID = MongoDB.ObjectID.createFromHexString(oldID.toHexString());

        var oldObject = { _id: oldID };
        var newObject = { _id: newID };
        var expectedDiff = {

        };

        chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);

        newID = new MongoDB.ObjectID();

        oldObject = { _id: oldID };
        newObject = { _id: newID };
        expectedDiff = {
            $set: { _id: newID }
        };

        chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
    });

    describe('arrays', function () {
        it('should correctly handle two pure arrays',() => {
            var oldObject = [1, 2, 3];
            var newObject = [4, 5, 6];
            var expectedDiff = {
                $set: { undefined: [4, 5, 6] }
            };

            chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });

        it('should correctly handle arrays which can be pulled', function () {
            var oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4], c: [1,2,3,4,5] };
            var newObject = { a: [1, 3, 4], b: [1, 3], c: [1] };
            var expectedDiff = {
                $pull: { a: 2 },
                $pullAll: { b: [2, 4], c: [2,3,4,5] }
            };

            chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });

        it('should correctly handle arrays which can be pushed', function () {
            var oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4], c: [1] };
            var newObject = { a: [1, 2, 3, 4, 5], b: [1, 2, 3, 4, 5, 6], c: [1,2,3,4,5] };
            var expectedDiff = {
                $push: { a: 5, b: { $each: [5, 6] }, c: { $each: [2, 3, 4, 5] } }
            };

            chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });

        it('should correctly handle arrays which should be replaced', function () {
            var oldObject = { a: [1, 2], b: [1, 2, 3] };
            var newObject = { a: [5, 4, 3], b: [5, 4, 3, 2] };
            var expectedDiff = {
                $set: {
                    a: [5, 4, 3],
                    b: [5, 4, 3, 2]
                }
            };

            chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        
        it("should correctly handle arrays which shrink in size and can't be pulled", () => {
            var oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4] };
            var newObject = { a: [1, 3, 5], b: [1, 3] };
            var expectedDiff = {
                $set: { a: [1,3,5] },
                $pullAll: { b: [2, 4] }
            };

            chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });

        it("should correctly handle arrays which can be partially modified", function () {
            var oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4] };
            var newObject = { a: [1, 2, 5, 4, 5], b: [1, 2, 5, 4, 5, 6] };
            var expectedDiff = {
                $set: {
                    'a.2': 5,
                    'a.4': 5,
                    'b.2': 5,
                    'b.4': 5,
                    'b.5': 6
                }
            };

            chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });

        it("should correctly diff array elements as objects", function () {
            var postDate = new Date();
            var oldObject = {
                comments: [
                    { id: 1, title: 'Title 1', text: 'test text 1', posted: postDate },
                    { id: 2, title: 'Title 2', text: 'test text 2', posted: postDate },
                    { id: 3, title: 'Title 3', text: 'test text 3', posted: postDate }
                ]
            };

            var newDate = new Date(postDate.getTime() + 50);
            var newObject = {
                comments: [
                    { id: 1, title: 'Title 1', text: 'tested text 1', posted: postDate },
                    { id: 2, title: 'Title 2', text: 'tested text 2', posted: postDate },
                    { id: 3, title: 'Title 3', text: 'test text 3', posted: newDate }
                ]
            };

            var expectedDiff = {
                $set: {
                    'comments.0.text': 'tested text 1',
                    'comments.1.text': 'tested text 2',
                    'comments.2.posted': newDate
                }
            };

            chai.expect(Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
    });
});