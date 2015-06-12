/// <reference path="../_references.d.ts" />
import MongoDB = require('mongodb');
import _ = require('lodash');
import skmatc = require('skmatc');
import Instance from './Instance';
import {Index, IndexSpecification} from './Index';
import {Schema} from './Schema';
import {InstanceImplementation} from './ModelInterfaces';

export function Collection(name: string) {
	return function(target: InstanceImplementation<any, any>) {
		target.collection = name;
	};
}

export function Index(spec: IndexSpecification, options?: MongoDB.IndexOptions) {
	return function(target: InstanceImplementation<any,any>) {
		target.indexes = target.indexes || [];
		
		if (options) target.indexes.push(<Index>{ spec: spec, options: options });
		else target.indexes.push(<Index>{ spec: spec });
	}
}

export function Validate(forType: any, validate: (schema: any, data: any, path: string) => Skmatc.Result) {
	return function(target: InstanceImplementation<any,any>) {
		target.validators = target.validators || [];
		target.validators.push(skmatc.create(schema => schema === forType, validate));
	}
}

export function Property(asType: any, required?: boolean): (target: { constructor: Function }, name: string) => void;
export function Property(name: string, asType: any, required?: boolean): (target: Function) => void;
export function Property(...args: any[]): (target: any, name?: string) => void {
	let name = null,
		asType = false,
		required = true;
	
	if (args.length > 1 && typeof args[args.length - 1] === 'boolean')
		required = args.pop();
	
	return function(target: any, property?: string) {
		if (!property) name = args.shift();
		else {
			name = property;
			target = target.constructor;
		}
		asType = args.pop();
		
		target.schema = target.schema || <Schema>{};
		if(!required) target.schema[name] = { $required: required, $type: asType };
		else target.schema[name] = asType;
	}
}

export function ObjectID(target: { constructor: typeof Instance }, name: string) {
	target.constructor.schema = target.constructor.schema || <Schema>{};
	target.constructor.schema[name] = { $required: false, $type: /^[0-9a-f]{24}$/ };
	target.constructor.identifier = {
		apply: function(value) { 
			return (value && value._bsontype == 'ObjectID') ? new MongoDB.ObjectID(value.id).toHexString() : value;
		},
		reverse: function (value) {
			if (value === null || value === undefined) return undefined;
			if (value && /^[a-f0-9]{24}$/.test(value)) return MongoDB.ObjectID.createFromHexString(value);
			return value;
		}
	};
}