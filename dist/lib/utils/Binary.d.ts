/// <reference types="node" />
import * as MongoDB from "mongodb";
/**
 * Converts a Node.js Buffer into a MongoDB Binary object. This is a shortcut
 * for `new require("mongodb").Binary(buffer)`.
 * @param value The Buffer which you would like to convert into a Binary object
 */
export declare function toBinary(value: Buffer): MongoDB.Binary;
