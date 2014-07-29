var Database = require('../index.js');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');
var Concoction = require('concoction');

describe('orm', function () {
	"use strict";

	describe('Instance', function () {
		var db = {
			plugins: []
		};

		describe('helpers', function () {

			describe('document', function() {
				it('should return the instance backing document', function() {
					var model = new Model(db, 'model', {}, {
						preprocessors: []
					});

					var i = new model.Instance({
						id: 'custom_id',
						name: 'name'
					});

					i.document.should.eql(i.__state.modified);
				});
			});

			describe('select', function() {
				it('should filter arrays by the selection function', function () {
					var model = new Model(db, 'model', {}, {
						preprocessors: []
					});

					var i = new model.Instance({
						id: 'custom_id',
						name: 'name',
						sessions: [
							'aaaa',
							'bbbb',
							'cccc',
							'dddd',
							'eeee'
						]
					});

					i.select(i.sessions, function(value) {
						return value == 'aaaa';
					}).should.eql(['aaaa']);
				});

				it('should correctly respond to preprocessing changes', function() {
					var model = new Model(db, 'model', {}, {
						preprocessors: []
					});

					var i = new model.Instance({
						id: 'custom_id',
						name: 'name',
						sessions: {
							'aaaa': { expires: new Date() },
							'bbbb': { expires: new Date() },
							'cccc': { expires: new Date() }
						}
					});

					i.select(i.sessions, function(value, key) {
						return key == 'aaaa';
					}).should.eql({ 'aaaa': i.sessions.aaaa });
				});
			});

			describe('first', function() {
				it('should filter arrays by the selection function', function () {
					var model = new Model(db, 'model', {}, {
						preprocessors: []
					});

					var i = new model.Instance({
						id: 'custom_id',
						name: 'name',
						sessions: [
							'aaaa',
							'bbbb',
							'cccc',
							'dddd',
							'eeee'
						]
					});

					i.first(i.sessions, function(value) {
						return value == 'aaaa';
					}).should.eql('aaaa');
				});

				it('should correctly respond to preprocessing changes', function() {
					var model = new Model(db, 'model', {}, {
						preprocessors: []
					});

					var i = new model.Instance({
						id: 'custom_id',
						name: 'name',
						sessions: {
							'aaaa': { expires: new Date() },
							'bbbb': { expires: new Date() },
							'cccc': { expires: new Date() }
						}
					});

					i.first(i.sessions, function(value, key) {
						return key == 'aaaa';
					}).should.eql(i.sessions.aaaa);
				});
			});
		});
	});
});
