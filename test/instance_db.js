describe('orm', function () {
    "use strict";

    describe('Instance', function () {
        var db = new Database(config);

        var model = new Model(db, 'instances', {
            username: String,
            age: Number,
            sessions: [{
                id: String,
                expires: Date
            }]
        }, {
            preprocessors: [
                new Concoction.Rename({ '_id': 'username' })
            ]
        });

        before(function () {
            return db.connect().then(function() {
                return model.remove();
            });
        });

        after(function() {
            db.disconnect();
        });

        describe('database', function () {
            describe('save', function() {
                it('should correctly store changes made to the instance', function() {
                    return model.create({
                        username: 'billy',
                        age: 10,
                        sessions: [{
                            id: 'aaaa',
                            expires: new Date()
                        }]
                    }).then(function(original) {
                        original.age = 12;

                        original.sessions.push({
                            id: 'bbbb',
                            expires: new Date()
                        });

                        return original.save().then(function(updated) {
                            updated.should.equal(original);
                            updated.age.should.eql(12);
                            updated.sessions.length.toString().should.eql('2');
                        });
                    });
                });

                it('should allow passing of specific change-sets', function() {
                    return model.create({
                        username: 'bob',
                        age: 12,
                        sessions: [{
                            id: 'aaaa',
                            expires: new Date()
                        }]
                    }).then(function(instance) {
                        return instance.save({ $set: { sessions: [] }, $inc: { age: 1 }});
                    }).then(function(instance) {
                        instance.age.should.eql(13);
                        instance.sessions.should.eql([]);
                    });
                });

                it('should allow conditions and changesets to be used', function() {
                    return model.create({
                        username: 'sally',
                        age: 15,
                        sessions: [{
                            id: 'aaaa',
                            expires: new Date()
                        }]
                    }).then(function(instance) {
                        return instance.save({ age: 14 }, { $inc: { age: 1 }});
                    }).then(function(instance) {
                        instance.age.should.eql(15);
                        return instance.save({ age: 15 }, { $inc: { age: 1 }});
                    }).then(function(instance) {
                        instance.age.should.eql(16);
                    });
                });
            });

            describe('update', function() {
                it('should retrieve the latest version of the model from the database', function() {
                    var billy1, billy2;
                    return model.findOne('billy').then(function(instance) {
                        billy1 = instance;
                        return model.findOne('billy');
                    }).then(function(instance) {
                        billy2 = instance;
                        billy1.age++;
                        return billy1.save();
                    }).then(function() {
                        billy2.age.should.equal(billy1.age - 1);
                        return billy2.update();
                    }).then(function() {
                        billy2.age.should.equal(billy1.age);
                    });
                });
            });

            describe('remove', function() {
                it('should remove instances from the database', function() {
                    return model.get('billy').then(function(instance) {
                        should.exist(instance);
                        return instance.remove();
                    }).then(function(instance) {
                        instance.__state.isNew.should.be.true;
                        return model.get('billy');
                    }).then(function(instance) {
                        should.not.exist(instance);
                    });
                });

                it('should set instance isNew to true after removal', function() {
                    return model.create({
                        username: 'billy',
                        age: 10,
                        sessions: [{
                            id: 'aaaa',
                            expires: new Date()
                        }]
                    }).then(function(original) {
                        should.exist(original);

                        original.__state.isNew.should.be.false;

                        return original.remove();
                    }).then(function(removed) {
                        removed.__state.isNew.should.be.true;
                    });
                });
            });
        });
    });
});