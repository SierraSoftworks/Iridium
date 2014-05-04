var config = require('./config.js');
var Database = require('../index.js');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');
var Concoction = require('concoction');

describe('bugs', function () {
    "use strict";
    var db = null;

    before(function (done) {
        db = new Database(config);
        db.connect(done);
    });

    it("shouldn't attempt to change an ObjectID when saving an instance", function(done) {
        var model = new Model(db, 'model', {
            id: false,
            data: [String]
        }, {

        });

        model.remove(function(err) {
            if(err) return done(err);

            model.create({ data: ['testing'] }, function(err, instance) {
                if(err) return done(err);
                should.exist(instance);

                instance.data.push('tested');
                instance.save(function(err) {
                    should.not.exist(err);
                    instance.data.should.eql(['testing', 'tested']);
                    done();
                });
            });
        });
    });
});