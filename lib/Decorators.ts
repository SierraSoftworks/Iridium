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

function GetDescriptor(target: Object, name: string): PropertyDescriptor {
	return Object.getOwnPropertyDescriptor(target, name) || {
		configurable: true,
		enumerable: true
	};
}

export function Property(target: Object, name: string, descriptor?: PropertyDescriptor) {
	let desc = descriptor || GetDescriptor(target, name);
	desc.get = function() { return this.document[name]; };
	desc.set = function(value) { this.document[name] = value; }; 
	
	if(descriptor) return desc;
	Object.defineProperty(target, name, desc);
}

export function ObjectID(target: Object, name: string, descriptor?: PropertyDescriptor) {
	let desc = descriptor || GetDescriptor(target, name);
	
	desc = Transform(function(value) { 
		return (value && value._bsontype == 'ObjectID') ? new MongoDB.ObjectID(value.id).toHexString() : value;
	}, function (value) {
        if (value === null || value === undefined) return undefined;
        if (value && /^[a-f0-9]{24}$/.test(value)) return MongoDB.ObjectID.createFromHexString(value);
        return value;
    });
	
	if(descriptor) return desc;
	Object.defineProperty(target, name, desc);
}

export function Transform(fromDB: (value: any) => any, toDB: (value: any) => any) {
	return function(target: Object, name: string, descriptor?: any) {
		let desc = descriptor || GetDescriptor(target, name);
		let get = desc.get || function() { return this.document[name]; },
			set = desc.set || function(value) { this.document[name] = value; };
			
		desc.get = function() {
			return fromDB(get.call(this));
		};
		
		desc.set = function(value) {
			return set.call(this, toDB(value));	
		};
			
		if(descriptor) return desc;
		Object.defineProperty(target, name, desc);
	}
}