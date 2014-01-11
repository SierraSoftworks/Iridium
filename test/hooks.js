var should = require('should'),
	Database = require('../'),
	Model = Database.Model,
	Instance = Database.Instance;

describe('hooks', function() {
	var db = new Database(require('./config'));

	before(function(done) {
		db.connect(done);
	});

	describe('creating', function() {
		function createModel(hook) {
			return new Model(db, 'hooks', {
				data: String,
				created: Date
			}, {
				hooks: {
					creating: hook
				}
			});
		}
		
		it('should correctly call the synchronous overload', function(done) {
			var hookCalled = false;
			var hookTarget = null;

			var model = createModel(function() {
				this.created = new Date();
				hookCalled = true;
				this.should.eql(hookTarget);
			});

			hookTarget = {
				data: 'Testing'
			};

			model.create(hookTarget, function(err, created) {
				if(err) return done(err);
				should.exist(created.created);
				hookCalled.should.be.true;
				return done();
			});
		});

		it('should correctly call the asynchronous overload', function(done) {
			var hookCalled = false;

			var model = createModel(function(done) {
				this.created = new Date();
				setTimeout(function() { hookCalled = true; done(); }, 100);
			});

			model.insert({ data: 'Testing' }, function(err, created) {
				if(err) return done(err);
				should.exist(created);
				should.exist(created.created);
				hookCalled.should.be.true;
				done();
			});
		});

		it('should convey errors in the synchronous overload', function(done) {
			var model = createModel(function() {
				throw new Error('Should fail');
			});

			model.insert({ data: 'Testing' }, function(err, inserted) {
				should.exist(err);
				err.message.should.eql('Should fail');
				should.not.exist(inserted);
				done();
			});
		});

		it('should convey errors in the asynchronous overload', function(done) {
			var model = createModel(function(done) {
				done(Error('Should fail'));
			});

			model.insert({ data: 'Testing' },function(err, inserted) {
				should.exist(err);
				err.message.should.eql('Should fail');
				should.not.exist(inserted);
				done();
			});
		});
	});

	describe('retrieved', function() {
		function createModel(hook) {
			return new Model(db, 'hooks', {
				data: String
			}, {
				hooks: {
					retrieved: hook
				}
			});
		}

		it('should correctly call before wrapping', function(done) {
			var expected = { data: 'Demo' };
			var hookCalled = false;
			var model = createModel(function() {
				this.should.eql(expected);
				hookCalled = true;
			});

			model.create(expected, function(err, inserted) {
				if(err) return done(err);

				should.exist(inserted);
				hookCalled.should.be.true;
				done();
			});
		});

		it('should allow preprocessing of properties', function(done) {
			var expected = { data: 'Demo' };
			var hookCalled = false;
			var model = createModel(function() {
				this.should.eql(expected);
				this.lastAccess = new Date();
				hookCalled = true;
			});

			model.create(expected, function(err, inserted) {
				if(err) return done(err);

				should.exist(inserted);
				hookCalled.should.be.true;
				should.exist(inserted.lastAccess);
				done();
			});
		});
	});
});