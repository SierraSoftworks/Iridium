describe('preprocessors', function() {
	describe('rename', function() {
		var rename = require('../lib/preprocessors/rename.js');
		it('should correctly transform properties', function() {
			var processor = new rename({
				from: 'to'
			});

			var obj = {
				p1: 'v1',
				from: 'expected'
			};

			processor.toLocal(obj);
			obj.should.have.ownProperty('p1', 'v1');
			obj.should.have.ownProperty('to', 'expected');

			processor.toSource(obj);
			obj.should.have.ownProperty('p1', 'v1');
			obj.should.have.ownProperty('from', 'expected');
		});
	});

	describe('conversion', function() {
		var conversion = require('../lib/preprocessors/conversion.js');
		it('should correctly transform properties', function() {
			var processor = new conversion({
				toUpper: {
					$up: function(obj) {
						return obj.toLowerCase();
					},
					$down: function(obj) {
						return obj.toUpperCase();
					}
				}
			});

			var obj = {
				toUpper: 'test string',
				pass: 'Something else'
			};

			processor.toLocal(obj);
			obj.should.have.ownProperty('toUpper', 'TEST STRING');
			obj.should.have.ownProperty('pass', 'Something else');

			processor.toSource(obj);
			obj.should.have.ownProperty('toUpper', 'test string');
			obj.should.have.ownProperty('pass', 'Something else');
		});

		it('should allow the transformation of an object\'s properties', function () {
			var original = {
				a: 'a',
				b: 1,
				c: 'c',
				d: 'd'
			};

			var expected = {
				a: 'aa',
				b: 1,
				c: 'c',
				d: 'd'
			};

			var trans = {
				a: { $up: function (value) { return value + value; } },
				b: false,
				c: { $up: false }
			};

			var processor = new conversion(trans);

			processor.toSource(original);

			original.should.eql(expected);
		});

		it('should remove properties where the transform returns undefined', function () {
			var original = {
				a: 1
			};

			var expected = {
				b: '1'
			};

			var trans = {
				a: { $up: function (value) { return undefined; } },
				b: { $up: function (value) { return '1'; } }
			};
			
			var processor = new conversion(trans);

			processor.toSource(original);

			original.should.eql(expected);
		});
	});
});