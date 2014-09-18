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
                });
            });

            describe('findOne', function() {
                it('should be able to locate a single object', function() {
                    return model.findOne({ name: 'Demo1' }).then(function(obj) {
                        should.exist(obj);
                        obj.should.have.property('name', 'Demo1');
                    });
                });

                it('should be able to infer the _id field', function() {
                    return model.findOne('Demo1').then(function(obj) {
                        should.exist(obj);
                        obj.should.have.property('name', 'Demo1');
                    });
                });

                it('should not throw an error if it couldn\'t find an object', function() {
                    return model.findOne({ name: 'NotFound' }).then(function(obj) {
                        should.not.exist(obj);
                    });
                });

                describe('promises', function() {
                    it('should work if a value is found', function() {
                        return model.findOne('Demo1').then(function(result) {
                            should.exist(result);
                        });
                    });

                    it('should work if a value is not found', function() {
                        return model.findOne('NotFound').then(function(result) {
                            should.not.exist(result);
                        });
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
                        });
                    });

                    var d1instance = null;

                    it('should correctly be able to find using conditions', function() {
                        return model.findOne({ name: 'Demo1' }).then(function(obj) {
                            should.exist(obj);
                            obj.should.have.property('name', 'Demo1');
                            d1instance = obj;
                        });
                    });

                    it('should correctly infer the _id field and convert conditions', function() {
                        return model.findOne(d1instance.id).then(function(obj) {
                            should.exist(obj);
                            obj.should.have.property('id');
                            obj.id.should.be.a('string');
                            obj.should.have.property('name', 'Demo1');
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
                        });
                    });

                    it('should return the raw document', function() {
                        return model.findOne({ name: 'Demo1' }, { wrap: false }).then(function(doc) {
                            should.exist(doc);
                            doc.should.have.ownProperty('id');
                            doc.should.have.ownProperty('name', 'Demo1');
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
                                description: 'Demonstration 1'
                            });
                        });
                    });

                    it('should return just the selected fields', function() {
                        return model.findOne({ name: 'Demo1' }, { fields: { id: 1, name: 1 }}).then(function(doc) {
                            should.exist(doc);
                            doc.document.should.have.ownProperty('name', 'Demo1');
                            doc.document.should.not.have.ownProperty('description');
                        });
                    });

                    it('should set the isPartial flag on its instances', function() {
                        return model.findOne({ name: 'Demo1' }, { fields: { id: 1, name: 1 }}).then(function(doc) {
                            should.exist(doc);
                            doc.__state.isPartial.should.be.true;
                        });
                    });

                    it('should work with wrap: false', function() {
                        return model.findOne({ name: 'Demo1' }, { wrap: false, fields: { id: 1, name: 1 }}).then(function(doc) {
                            should.exist(doc);
                            doc.should.have.ownProperty('name', 'Demo1');
                            doc.should.not.have.ownProperty('description');
                        });
                    });
                });
            });
        });
    });
});
