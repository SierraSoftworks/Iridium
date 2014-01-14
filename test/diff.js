var diff = require('../lib/utils/diff');

describe('diff', function() {
	it('should correctly diff basic objects', function() {
		var o1 = {
			a: 1,
			b: 'test',
			c: 2,
			d: 'constant',
			e: 'old'
		};

		var o2 = {
			a: 3,
			b: 'tested',
			c: 2,
			d: 'constant',
			f: 'new'
		};

		var expected = {
			$inc: { a: 2 },
			$set: { b: 'tested', f: 'new' },
			$unset: { e: 1 }
		};

		diff(o1, o2).should.eql(expected);
	});

	it('should correctly diff complex objects', function() {
		var o1 = {
			a: { value: 1 },
			b: { value1: 1, value2: 1 },
			c: { value: 2 },
			d: { value: {} },
			e: { value: true }
		};

		var o2 = {
			a: { value: 3 },
			b: { value1: 'tested', value2: 2 },
			c: { value: 2 },
			d: { value: {} },
			e: { value2: false }
		};

		var expected = {
			$inc: { 'a.value': 2, 'b.value2': 1 },
			$set: { 'b.value1': 'tested', 'e.value2': false },
			$unset: { 'e.value': 1 }
		};

		diff(o1, o2).should.eql(expected);
	});

	describe('arrays', function() {
		it('should correctly handle arrays which can be pulled', function() {
			var a1 = { a: [1,2,3,4], b: [1,2,3,4] };
			var a2 = { a: [1,3,4], b: [1,3] };
			var expected = {
				$pull: { a: 2 },
				$pullAll: { b: [2,4] }
			};

			diff(a1, a2).should.eql(expected);
		});

		it('should correctly handle arrays which can be pushed', function() {
			var a1 = { a: [1,2,3,4], b: [1,2,3,4] };
			var a2 = { a: [1,2,3,4,5], b: [1,2,3,4,5,6] };
			var expected = {
				$push: { a: 5, b: { $each: [5,6] }}
			};

			diff(a1, a2).should.eql(expected);
		});

		it('should correctly handle arrays which should be replaced', function() {
			var a1 = { a: [1,2], b: [1,2,3] };
			var a2 = { a: [5,4,3], b: [5,4,3,2] };
			var expected = {
				$set: {
					a: [5,4,3],
					b: [5,4,3,2]
				}
			};

			diff(a1, a2).should.eql(expected);
		});

		it("should correctly handle arrays which can be partially modified", function() {
			var a1 = { a: [1,2,3,4], b: [1,2,3,4] };
			var a2 = { a: [1,2,5,4,5], b: [1,2,5,4,5,6] };
			var expected = {
				$set: {
					'a.2': 5,
					'a.4': 5,
					'b.2': 5,
					'b.4': 5,
					'b.5': 6
				}
			};

			diff(a1, a2).should.eql(expected);
		});

		it("should correctly diff array elements as objects", function() {
			var postDate = new Date();
			var a1 = { comments: [
				{ id: 1, title: 'Title 1', text: 'test text 1', posted: postDate },
				{ id: 2, title: 'Title 2', text: 'test text 2', posted: postDate },
				{ id: 3, title: 'Title 3', text: 'test text 3', posted: postDate }
			]};

			var newDate = new Date(postDate.getTime() + 50);
			var a2 = { comments: [
				{ id: 1, title: 'Title 1', text: 'tested text 1', posted: postDate },
				{ id: 2, title: 'Title 2', text: 'tested text 2', posted: postDate },
				{ id: 3, title: 'Title 3', text: 'test text 3', posted: newDate }
			]};

			var expected = {
				$set: {
					'comments.0.text': 'tested text 1',
					'comments.1.text': 'tested text 2',
					'comments.2.posted': newDate
				}
			};

			diff(a1, a2).should.eql(expected);
		});
	});
});