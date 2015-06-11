/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');

import Instance from './Instance';
import {Index, IndexSpecification} from './Index';

export function Index(spec: IndexSpecification, options?: MongoDB.IndexOptions) {
	return function(target: typeof Instance) {
		target.indexes = target.indexes || [];
		
		if (options) target.indexes.push(<Index>{ spec: spec, options: options });
		else target.indexes.push(<Index>{ spec: spec });
	}
}

export function Identifier(fromDB: (value: any) => any, toDB: (value: any) => any) {
	return function(target: typeof Instance) {
		target.identifier = {
			apply: fromDB,
			reverse: toDB
		};
	}
}

export function Validate(type: any) {
	return function(target: typeof Instance, name: string, descriptor: any) {
		descriptor.validateType = type;
		
		return descriptor;
	}
}