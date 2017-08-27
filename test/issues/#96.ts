import {BuildUrl} from "../../lib/utils/UrlBuilder";
import {Configuration} from "../../lib/Configuration";
import * as chai from "chai";

describe("issues", () => {
    describe("#96", () => {
        const tests: {
            name: string;
            config: Configuration;
            expectedUrl: string;
        }[] = [
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
                    chai.expect(() => BuildUrl(test.config)).to.not.throw;
                });

                it("should return a string", () => {
                    chai.expect(BuildUrl(test.config)).to.exist.and.be.a("string");
                });

                it("should match the expected URL", () => {
                    chai.expect(BuildUrl(test.config)).to.eql(test.expectedUrl);
                });
            });
        });
    });
});