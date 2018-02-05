import * as MongoDB from "mongodb";
import * as Skmatc from "skmatc";

// TODO: Add documentation
export function DefaultValidators() {
	return [
		Skmatc.create(schema => schema === MongoDB.ObjectID, function(schema, data) {
			return this.assert(!data || data instanceof MongoDB.ObjectID || (data._bsontype === "ObjectID" && data.id), "Expected " + JSON.stringify(data) + " to be a valid MongoDB.ObjectID object");
		}, { name: "ObjectID validation" }),
		Skmatc.create(schema => schema === Buffer, function(schema, data) {
			return this.assert(data && (data instanceof MongoDB.Binary || (data._bsontype === "Binary" && data.buffer)), "Expected " + JSON.stringify(data) + " to be a valid MongoDB.Binary object");
		}, { name: "Buffer validation" })
	];
}