/// <reference path="../typings/DefinitelyTyped/tsd.d.ts" />
import * as Iridium from "../index";
import MongoDB = require("mongodb");

describe("Utilities", () => {
	describe("toObjectID", () => {
		it("should convert hex strings to ObjectIDs", () => {
			let oID = Iridium.toObjectID("aaaaaaaaaaaaaaaaaaaaaaaa");
			chai.expect(oID).to.be.instanceOf(MongoDB.ObjectID);
			chai.expect(oID.toHexString()).to.eql("aaaaaaaaaaaaaaaaaaaaaaaa");
		});

		it("should throw an error if your string is not a valid ObjectID", () => {
			chai.expect(() => {
				Iridium.toObjectID("aaaaaaaaaaaaaaaa");
			}).to.throw;
		});
	});
})