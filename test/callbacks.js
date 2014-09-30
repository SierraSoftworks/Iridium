describe('orm', function () {
    "use strict";

    describe('Callbacks', function () {
        var db = new Database(config);

        before(function (done) {
            db.connect(done);
        });

        after(function() {
            db.disconnect();
        });

        describe('database', function() {
            var model = null;

            before(function(done) {
                model =  new Model(db, 'model', {
                    name: /.+/
                }, {
                    preprocessors: [new Concoction.Rename({ _id: 'name' })]
                });

                model.remove(function(err) {
                    if(err) return done(err);
                    model.create({ name: 'Demo1' }, function(err) {
                        if(err) return done(err);
                        model.create({ name: 'Demo2' }, done);
                    });
                });
            });

            describe('find', function() {
                it('should be able to get all objects', function(done) {
                    return model.find(function(err, objs) {
                        if(err) return done(err);
                        should.exist(objs);
                        objs.length.should.equal(2);
                        return done();
                    });
                });

                it('should not throw an error if it couldn\'t find an object', function(done) {
                    return model.find({ name: 'NotFound' }, function(err, objs) {
                        if(err) return done(err);
                        should.exist(objs);
                        objs.length.should.equal(0);
                        return done();
                    });
                });
            });

            describe('findOne', function() {
                it('should be able to get a single object', function(done) {
                    return model.findOne(function(err, obj) {
                        if(err) return done(err);
                        should.exist(obj);
                        obj.name.should.eql('Demo1');
                        return done();
                    });
                });

                it('should not throw an error if it couldn\'t find an object', function(done) {
                    return model.findOne({ name: 'NotFound' }, function(err, obj) {
                        if(err) return done(err);
                        should.not.exist(obj);
                        return done();
                    });
                });
            });
        });
    });
});
