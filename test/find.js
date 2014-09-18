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

                return model.remove().then(function() {
                    return model.create({ name: 'Demo1' });
                }).then(function() {
                    return model.create({ name: 'Demo2' });
                });
            });

            describe('find', function() {
                it('should be able to get all objects', function() {
                    return model.find().then(function(objs) {
                        should.exist(objs);
                        objs.length.should.equal(2);
                    });
                });

                it('should correctly wrap individual objects', function() {
                    return model.find().then(function(objs) {
                        should.exist(objs);
                        objs.length.should.equal(2);                        
                        objs[0].should.have.property('document');           
                        objs[1].should.have.property('document');
                    });
                });

                it('should not throw an error if it couldn\'t find an object', function() {
                    return model.find({ name: 'NotFound' }).then(function(objs) {
                        should.exist(objs);
                        objs.length.should.equal(0);
                    });
                });

                describe('with default model', function() {                 
                    before(function() {
                        model =  new Model(db, 'model', {
                            name: /.+/
                        }, {

                        });

                        return model.remove().then(function() {
                            return model.create({
                                name: 'Demo1'
                            });
                        }).then(function() {
                            return model.create({
                                name: 'Demo2'
                            });
                        });
                    });

                    it('should correctly be able to find using conditions', function() {
                        return model.find({ name: 'Demo1' }).then(function(objs) {
                            should.exist(objs);
                            objs[0].should.have.property('name').and.eql('Demo1');
                        });
                    });
                });

                describe('with wrap:false', function() {
                    before(function() {
                        model =  new Model(db, 'model', {
                            name: /.+/
                        }, {

                        });

                        return model.remove().then(function() {
                            return model.create({
                                name: 'Demo1'
                            });
                        }).then(function() {
                            return model.create({
                                name: 'Demo2'
                            });
                        });
                    });

                    it('should return the raw document', function() {
                        return model.find({ name: 'Demo1' }, { wrap: false }).then(function(docs) {
                            should.exist(docs);
                            docs.length.should.equal(1);
                            docs[0].should.have.ownProperty('id');
                            docs[0].should.have.ownProperty('name');
                            docs[0].name.should.eql('Demo1');
                        });
                    });
                });

                describe('with partial results', function() {
                    before(function() {
                        model =  new Model(db, 'model', {
                            name: /.+/,
                            description: String
                        }, {

                        });

                        return model.remove().then(function() {
                            return model.create({
                                name: 'Demo1',
                                description: 'Demo 1'
                            });
                        }).then(function() {
                            return model.create({
                                name: 'Demo2',
                                description: 'Demo 2'
                            });
                        });
                    });
                    
                    it('should return just the selected fields', function() {
                        return model.find({ }, { fields: { id: 1, name: 1 }}).then(function(docs) {
                            should.exist(docs);
                            docs.length.should.equal(2);
                            var doc = docs[0];
                            doc.document.should.have.ownProperty('name');
                            doc.document.should.not.have.ownProperty('description');
                        });
                    });

                    it('should set the isPartial flag on its instances', function() {
                        return model.find({ name: 'Demo1' }, { fields: { id: 1, name: 1 }}).then(function(docs) {
                            should.exist(docs);
                            docs.length.should.equal(1);
                            docs[0].__state.isPartial.should.be.true;
                        });
                    });

                    it('should work with wrap: false', function() {
                        return model.find({ name: 'Demo1' }, { wrap: false, fields: { id: 1, name: 1 }}).then(function(docs) {
                            should.exist(docs);
                            docs.length.should.equal(1);
                            docs[0].should.have.ownProperty('name');
                            docs[0].name.should.eql('Demo1');
                            docs[0].should.not.have.ownProperty('description');
                        });
                    });
                });
            });
        });
    });
});
