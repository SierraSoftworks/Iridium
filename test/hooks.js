describe('hooks', function() {
    var db = new Database(config);

    before(function() {
        return db.connect();
    });

    after(function() {
        db.disconnect();
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
        
        it('should correctly call the synchronous overload', function() {
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

            return model.create(hookTarget).then(function(created) {
                should.exist(created.created);
                hookCalled.should.be.true;
            });
        });

        it('should correctly call the asynchronous overload', function() {
            var hookCalled = false;

            var model = createModel(function(done) {
                this.created = new Date();
                setTimeout(function() { hookCalled = true; done(); }, 1);
            });

            return model.insert({ data: 'Testing' }).then(function(created) {
                should.exist(created);
                should.exist(created.created);
                hookCalled.should.be.true;
            });
        });

        it('should convey errors in the synchronous overload', function() {
            var model = createModel(function() {
                throw new Error('Should fail');
            });

            return model.insert({ data: 'Testing' }).then(function(inserted) {
                should.fail();
            }, function(err) {
                err.message.should.eql('Should fail');
                return Q();
            });
        });

        it('should convey errors in the asynchronous overload', function() {
            var model = createModel(function(done) {
                done(Error('Should fail'));
            });

            return model.insert({ data: 'Testing' }).then(function(inserted) {
                should.fail();
            }, function(err) {
                err.message.should.eql('Should fail');
                return Q();
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

        it('should correctly call before wrapping', function() {
            var expected = { data: 'Demo' };
            var hookCalled = false;
            var model = createModel(function() {
                this.should.eql(expected);
                hookCalled = true;
            });

            return model.create(expected).then(function(inserted) {
                should.exist(inserted);
                hookCalled.should.be.true;
            });
        });

        it('should allow preprocessing of properties', function() {
            var expected = { data: 'Demo' };
            var hookCalled = false;
            var model = createModel(function() {
                this.should.eql(expected);
                this.lastAccess = new Date();
                hookCalled = true;
            });

            return model.create(expected).then(function(inserted) {
                should.exist(inserted);
                hookCalled.should.be.true;
                should.exist(inserted.lastAccess);
            });
        });
    });
});