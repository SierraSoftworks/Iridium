"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Omnom_1 = require("../lib/utils/Omnom");
const MongoDB = require("mongodb");
const chai = require("chai");
describe("Omnom", () => {
    it("should correctly diff basic objects", () => {
        let oldObject = {
            a: 1,
            b: "test",
            c: 2,
            d: "constant",
            e: "old"
        };
        let newObject = {
            a: 3,
            b: "tested",
            c: 2,
            d: "constant",
            f: "new"
        };
        let expectedDiff = {
            $set: { a: 3, b: "tested", f: "new" },
            $unset: { e: true }
        };
        chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
    });
    it("should correctly diff basic objects with atomic number changes", () => {
        let oldObject = {
            a: 1,
            b: "test",
            c: 2,
            d: "constant",
            e: "old"
        };
        let newObject = {
            a: 3,
            b: "tested",
            c: 2,
            d: "constant",
            f: "new"
        };
        let expectedDiff = {
            $set: { b: "tested", f: "new" },
            $inc: { a: 2 },
            $unset: { e: true }
        };
        chai.expect(Omnom_1.Omnom.diff(oldObject, newObject, { atomicNumbers: true })).to.exist.and.be.eql(expectedDiff);
    });
    it("should correctly diff complex objects", function () {
        let oldObject = {
            a: { value: 1 },
            b: { value1: 1, value2: 1 },
            c: { value: 2 },
            d: { value: {} },
            e: { value: true }
        };
        let newObject = {
            a: { value: 3 },
            b: { value1: "tested", value2: 2 },
            c: { value: 2 },
            d: { value: {} },
            e: { value2: false }
        };
        let expectedDiff = {
            $set: { "a.value": 3, "b.value1": "tested", "b.value2": 2, "e.value2": false },
            $unset: { "e.value": true }
        };
        chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
    });
    it("should correctly diff deep objects", function () {
        let oldObject = {
            a: {
                b: {
                    c: {
                        m: {
                            x: 1,
                            y: 2,
                            z: "test"
                        }
                    },
                    d: {
                        m: {
                            x: 1,
                            y: 2,
                            z: "test"
                        }
                    },
                    e: {
                        m: {
                            x: 1,
                            y: 2,
                            z: "test"
                        }
                    }
                }
            }
        };
        let newObject = {
            a: {
                b: {
                    c: {
                        n: {
                            x: 1,
                            y: 2,
                            z: "test"
                        }
                    },
                    d: {
                        m: {
                            w: 1,
                            y: 2,
                            z: "test"
                        }
                    },
                    e: {
                        m: {
                            x: 1,
                            y: 4,
                            z: "test"
                        }
                    }
                }
            }
        };
        let expectedDiff = {
            $set: { "a.b.c.n": { x: 1, y: 2, z: "test" }, "a.b.d.m.w": 1, "a.b.e.m.y": 4 },
            $unset: { "a.b.c.m": true, "a.b.d.m.x": true }
        };
        chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
    });
    it("should correctly diff ObjectIDs", function () {
        let oldID = new MongoDB.ObjectID();
        let newID = MongoDB.ObjectID.createFromHexString(oldID.toHexString());
        let oldObject = { _id: oldID };
        let newObject = { _id: newID };
        let expectedDiff = {};
        chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        newID = new MongoDB.ObjectID();
        oldObject = { _id: oldID };
        newObject = { _id: newID };
        expectedDiff = {
            $set: { _id: newID }
        };
        chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
    });
    describe("unset", function () {
        it("should correctly unset properties which are removed", () => {
            let oldObject = {
                a: 10,
                b: 10
            };
            let newObject = {
                a: 10
            };
            let expectedDiff = {
                $unset: { b: true }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should correctly handle properties which are set to null", () => {
            let oldObject = {
                a: 10,
                b: 10
            };
            let newObject = {
                a: 10,
                b: null
            };
            let expectedDiff = {
                $set: { b: null }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
    });
    describe("arrays", function () {
        it("should correctly handle two pure arrays", () => {
            let oldObject = { arr: [1, 2, 3] };
            let newObject = { arr: [4, 5, 6] };
            let expectedDiff = {
                $set: { arr: [4, 5, 6] }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should correctly handle arrays which can be pulled", function () {
            let oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4], c: [1, 2, 3, 4, 5] };
            let newObject = { a: [1, 3, 4], b: [1, 3], c: [1] };
            let expectedDiff = {
                $pull: { a: 2 },
                $pullAll: { b: [2, 4], c: [2, 3, 4, 5] }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should correctly handle arrays which can be pushed", function () {
            let oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4], c: [1] };
            let newObject = { a: [1, 2, 3, 4, 5], b: [1, 2, 3, 4, 5, 6], c: [1, 2, 3, 4, 5] };
            let expectedDiff = {
                $push: { a: 5, b: { $each: [5, 6] }, c: { $each: [2, 3, 4, 5] } }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should correctly handle arrays which should be replaced", function () {
            let oldObject = { a: [1, 2], b: [1, 2, 3] };
            let newObject = { a: [5, 4, 3], b: [5, 4, 3, 2] };
            let expectedDiff = {
                $set: {
                    a: [5, 4, 3],
                    b: [5, 4, 3, 2]
                }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should correctly handle arrays which shrink in size and can't be pulled", () => {
            let oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4] };
            let newObject = { a: [1, 3, 5], b: [1, 3] };
            let expectedDiff = {
                $set: { a: [1, 3, 5] },
                $pullAll: { b: [2, 4] }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should correctly handle arrays which can be partially modified", function () {
            let oldObject = { a: [1, 2, 3, 4], b: [1, 2, 3, 4] };
            let newObject = { a: [1, 2, 5, 4, 5], b: [1, 2, 5, 4, 5, 6] };
            let expectedDiff = {
                $set: {
                    "a.2": 5,
                    "a.4": 5,
                    "b.2": 5,
                    "b.4": 5,
                    "b.5": 6
                }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should correctly diff array elements as objects", function () {
            let postDate = new Date();
            let oldObject = {
                comments: [
                    { id: 1, title: "Title 1", text: "test text 1", posted: postDate },
                    { id: 2, title: "Title 2", text: "test text 2", posted: postDate },
                    { id: 3, title: "Title 3", text: "test text 3", posted: postDate }
                ]
            };
            let newDate = new Date(postDate.getTime() + 50);
            let newObject = {
                comments: [
                    { id: 1, title: "Title 1", text: "tested text 1", posted: postDate },
                    { id: 2, title: "Title 2", text: "tested text 2", posted: postDate },
                    { id: 3, title: "Title 3", text: "test text 3", posted: newDate }
                ]
            };
            let expectedDiff = {
                $set: {
                    "comments.0.text": "tested text 1",
                    "comments.1.text": "tested text 2",
                    "comments.2.posted": newDate
                }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should handle complex array objects which should be replaced in a smaller array", () => {
            let oldObject = { a: [{ x: 1, y: "a" }, { x: 2, y: "b" }, { x: 3, y: "c" }, { x: 4, y: "d" }] };
            let newObject = { a: [{ x: 1, y: "z" }, { x: 2, y: "y" }] };
            let expectedDiff = {
                $set: {
                    "a": [{ x: 1, y: "z" }, { x: 2, y: "y" }]
                }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
        it("should handle complex array objects which should be replaced in a larger array", () => {
            let oldObject = { a: [{ x: 1, y: "a" }, { x: 2, y: "b" }] };
            let newObject = { a: [{ x: 1, y: "z" }, { x: 2, y: "y" }, { x: 3, y: "x" }, { x: 4, y: "w" }] };
            let expectedDiff = {
                $set: {
                    "a.0.y": "z",
                    "a.1.y": "y",
                    "a.2": { x: 3, y: "x" },
                    "a.3": { x: 4, y: "w" }
                }
            };
            chai.expect(Omnom_1.Omnom.diff(oldObject, newObject)).to.exist.and.be.eql(expectedDiff);
        });
    });
});
//# sourceMappingURL=Omnom.js.map