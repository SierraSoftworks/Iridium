var async = require('async'),
	MongoClient = require('mongodb').MongoClient,
	Iridium = require('./');

var objects = [];
for(var i = 0; i < 10000; i++)
	objects.push({
		name: 'John',
		surname: 'Doe',
		birthday: new Date()
	});

var iDB = new Iridium({
	database: 'iridium_bench'
});

var model = new Iridium.Model(iDB, 'iridium', {
	name: String,
	surname: String,
	birthday: Date
});

iDB.register('model', model);

function printTime(format, start) {
	var ms = (new Date()).getTime() - start.getTime();
	console.log(format, ms.toString() + 'ms');
}

MongoClient.connect('mongodb://localhost/iridium_bench', function(err, mDB) {
	if(err) throw err;

	iDB.connect(function(err) {
		if(err) throw err;

		// Both databases are ready, let's start testing...

		var mDBcol = mDB.collection('mongo');
		async.series([
			function(done) {
				mDBcol.remove({}, { w: 1 }, function(err, removed) {
					if(err) return done(err);
					return done();
				});
			},
			function(done) {
				model.remove({}, function(err, removed) {
					if(err) return done(err);
					return done();
				});
			},
			function(done) {
				console.log('MongoDB 10000 Inserts { w: 1 }');
				var start = new Date();
				mDBcol.insert(objects, { w: 1 }, function(err, inserted) {
					if(err) return done(err);
					printTime(' => %s', start);
					return done();
				});
			},
			function(done) {
				console.log('Iridium 10000 Inserts { w: 1, wrap: false }');
				var start = new Date();
				model.insert(objects, false, function(err, inserted) {
					if(err) return done(err);
					printTime(' => %s', start);
					return done();
				});
			},
			function(done) {
				console.log('MongoDB find()');
				var start = new Date();
				mDBcol.find({}).toArray(function(err, results) {
					if(err) return done(err);
					printTime(' => %s', start);
					return done();
				});				
			},
			function(done) {
				console.log('Iridium find() { wrap: false }');
				var start = new Date();
				model.find({}, false, function(err, results) {
					if(err) return done(err);
					printTime(' => %s', start);
					return done();
				});				
			},
			function(done) {
				console.log('MongoDB remove()');
				var start = new Date();
				mDBcol.remove({}, function(err, results) {
					if(err) return done(err);
					printTime(' => %s', start);
					return done();
				});				
			},
			function(done) {
				console.log('Iridium remove()');
				var start = new Date();
				model.remove(function(err, results) {
					if(err) return done(err);
					printTime(' => %s', start);
					return done();
				});				
			}
		], function(err) {
			if(err) throw err;

			mDB.close();
			iDB.disconnect();
		});
	});
});