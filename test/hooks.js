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

        it('should not support an asynchronous overload', function() {
            var hookCalled = false;

            var model = createModel(function(done) {
                should.fail('asynchronous overload should not be supported');
            });

            return model.insert({ data: 'Testing' }).then(function(created) {
                should.fail('asynchronous overload should not be supported');
            }, function(err) {
                return Promise.resolve();
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
                return Promise.resolve();
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
    
    describe('ready', function() {
        function createModel(hook) {
            return new Model(db, 'hooks', {
                data: String
            }, {
                hooks: {
                    ready: hook
                }
            });
        }

        it('should correctly call after wrapping', function() {
            var expected = { data: 'Demo' };
            var hookCalled = false;
            var model = createModel(function() {
                should.exist(this.document);
                this.document.should.eql(expected);
                hookCalled = true;
            });

            return model.create(expected).then(function(inserted) {
                should.exist(inserted);
                hookCalled.should.be.true;
            });
        });

        it('should allow postprocessing of Instance', function() {
            var expected = { data: 'Demo' };
            var hookCalled = false;
            var model = createModel(function() {
                should.exist(this.document);
                this.document.should.eql(expected);
                this.lastAccess = new Date();
                hookCalled = true;
            });

            return model.create(expected).then(function(inserted) {
                should.exist(inserted);
                inserted.document.should.eql(expected);
                hookCalled.should.be.true;
                should.exist(inserted.lastAccess);
            });
        });
    });
});