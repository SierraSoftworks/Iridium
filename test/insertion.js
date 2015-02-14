describe('orm', function () {
    "use strict";

    describe('Model', function () {
        var db = new Database(config);

        before(function () {
            return db.connect();
        });

        after(function() {
            db.disconnect();
        });

        describe('database', function() {
            var model = null;

            before(function() {
                model =  new Model(db, 'model', {
                    name: /.+/
                }, {
                    preprocessors: [new Concoction.Rename({ _id: 'name' })]
                });

                return model.remove();
            });

            describe('insertion', function() {

                it('should allow a single object to be inserted', function() {
                    return model.create({
                        name: 'Demo1'
                    }).then(function(instance) {
                        instance.should.have.property('name', 'Demo1');
                    });
                });

                it('should have created the instance in the database', function() {
                    return model.count({ name: 'Demo1' }).then(function(number) {
                        number.should.eql(1);
                    });
                });

                it('should allow multiple objects to be inserted', function() {
                    return model.create([{
                        name: 'Demo2'
                    }, {
                        name: 'Demo3'
                    }]).then(function(instances) {
                        Array.isArray(instances).should.be.true;
                        instances[0].should.have.property('name', 'Demo2');
                        instances[1].should.have.property('name', 'Demo3');
                    });
                });

                it('should pass along DB errors', function() {
                    return model.create({
                        name: 'Demo1'
                    }).then(function(inserted) {
                        should.not.exist(inserted);
                    }, function(err) {
                        return Promise.resolve();
                    });
                });

                it('should support upsert operations on new documents', function() {
                    return model.create({
                        name: 'Demo4',
                        upserted: true
                    }, { upsert: true }).then(function(updated) {
                        should.exist(updated);
                        updated.should.have.property('upserted').and.equal(true);
                    });
                });

                it('should support upsert operations on existing documents', function() {
                    return model.create({
                        name: 'Demo1',
                        upserted: true
                    }, { upsert: true }).then(function(updated) {
                        should.exist(updated);
                        updated.should.have.property('upserted').and.equal(true);
                    });
                });

                it('should support upsert operations with multiple documents', function() {
                    return model.create([{
                        name: 'Demo1',
                        upserted: true
                    },{
                        name: 'Demo5',
                        upserted: true
                    }], { upsert: true }).then(function(updated) {
                        should.exist(updated);
                        updated.length.should.equal(2);
                    });
                });
            });
        });
    });
});
