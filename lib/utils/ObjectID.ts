/// <reference path="../../_references.d.ts" />
import MongoDB = require('mongodb');

export function toObjectID(value: string): MongoDB.ObjectID {
	return MongoDB.ObjectID.createFromHexString(value);
}