import * as Iridium from "../iridium";
import * as MongoDB from "mongodb";
import * as chai from "chai";

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

	describe("toDecimal128", () => {
		it("should allow you to convert a string to a Decimal128", () => {
			let dec = Iridium.toDecimal128("1.24");
			chai.expect(dec).to.be.instanceOf(MongoDB.Decimal128);
			chai.expect(dec.toString()).to.eql("1.24");
		});
	});
	
		describe("toLong", () => {
			it("should allow you to convert a number to a Long", () => {
				let lng = Iridium.toLong(124);
				chai.expect(lng).to.be.instanceOf(MongoDB.Long);
				chai.expect(lng.toString()).to.eql("124");
			});

			it("should allow you to convert a string to a Long", () => {
				let lng = Iridium.toLong("124");
				chai.expect(lng).to.be.instanceOf(MongoDB.Long);
				chai.expect(lng.toString()).to.eql("124");
			});
		});
})