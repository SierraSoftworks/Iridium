/// <reference path="../typings/DefinitelyTyped/tsd.d.ts" />
import * as Iridium from '../index';

describe("Iridium",() => {
    it("should expose the Core",() => {
        chai.expect(Iridium.Core).to.exist.and.be.a('function');
    });

    it("should expose the Model constructor", () => {
        chai.expect(Iridium.Model).to.exist.and.be.a('function');
    });

    it("should expose the default Instance class",() => {
        chai.expect(Iridium.Instance).to.exist.and.be.a('function');
    });
});