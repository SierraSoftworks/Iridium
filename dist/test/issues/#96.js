"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UrlBuilder_1 = require("../../lib/utils/UrlBuilder");
const chai = require("chai");
describe("issues", () => {
    describe("#96", () => {
        const tests = [
            {
                name: "failure_case",
                config: {
                    host: "mongodb",
                    port: 27017,
                    database: "test_db"
                },
                expectedUrl: "mongodb://mongodb:27017/test_db"
            }
        ];
        tests.forEach(test => {
            describe(test.name, () => {
                it("should not throw an error", () => {
                    chai.expect(() => UrlBuilder_1.BuildUrl(test.config)).to.not.throw;
                });
                it("should return a string", () => {
                    chai.expect(UrlBuilder_1.BuildUrl(test.config)).to.exist.and.be.a("string");
                });
                it("should match the expected URL", () => {
                    chai.expect(UrlBuilder_1.BuildUrl(test.config)).to.eql(test.expectedUrl);
                });
            });
        });
    });
});
//# sourceMappingURL=#96.js.map