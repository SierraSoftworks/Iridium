var config = require('./config.js');
var Database = require('../index.js');
var Model = Database.Model;
var Instance = Database.Instance;
var should = require('should');
var Concoction = require('concoction');

describe('orm', function () {
    "use strict";

    describe('Model', function () {
        var db = null;

        before(function (done) {
            db = new Database(config);
            db.connect(done);
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

                    model.create({
                        name: 'Demo1'
                    }, function(err, instance) {
                        if(err) return done(err);
                        return done();
                    });
                });
            });

            describe('findOne', function() {
                it('should be able to locate a single object', function(done) {
                    model.findOne({ name: 'Demo1' }, function(err, obj) {
                        if(err) return done(err);
                        should.exist(obj);
                        obj.should.have.property('name', 'Demo1');
                        done();
                    });
                });

                it('should be able to infer the _id field', function(done) {
                    model.findOne('Demo1', function(err, obj) {
                        if(err) return done(err);
                        should.exist(obj);
                        obj.should.have.property('name', 'Demo1');
                        done();
                    });
                });

                it('should not throw an error if it couldn\'t find an object', function(done) {
                    model.findOne({ name: 'NotFound' }, function(err, obj) {
                        if(err) return done(err);
                        should.not.exist(obj);
                        done();
                    });
                });

                describe('promises', function() {
                    it('should work if a value is found', function(done) {
                        model.findOne('Demo1').then(function(result) {
                            should.exist(result);
                            done();
                        }, done);
                    });

                    it('should work if a value is not found', function(done) {
                        model.findOne('NotFound').then(function(result) {
                            should.not.exist(result);
                            done();
                        }, done);
                    });
                });

                describe('with default model', function() {                 
                    before(function(done) {
                        model =  new Model(db, 'model', {
                            name: /.+/
                        }, {

                        });

                        model.remove(function(err) {
                            if(err) return done(err);

                            model.create({
                                name: 'Demo1'
                            }, function(err, instance) {
                                if(err) return done(err);
                                return done();
                            });
                        });
                    });

                    var d1instance = null;

                    it('should correctly be able to find using conditions', function(done) {
                        model.findOne({ name: 'Demo1' }, function(err, obj) {
                            if(err) return done(err);
                            should.exist(obj);
                            obj.should.have.property('name', 'Demo1');
                            d1instance = obj;
                            done();
                        });
                    });

                    it('should correctly infer the _id field and convert conditions', function(done) {
                        model.findOne(d1instance.id, function(err, obj) {
                            if(err) return done(err);
                            should.exist(obj);
                            obj.should.have.property('id').with.type('string');
                            obj.should.have.property('name', 'Demo1');
                            done();
                        });
                    });
                });

                describe('with wrap:false', function() {
                    before(function(done) {
                        model =  new Model(db, 'model', {
                            name: /.+/
                        }, {

                        });

                        model.remove(function(err) {
                            if(err) return done(err);

                            model.create({
                                name: 'Demo1'
                            }, function(err, instance) {
                                if(err) return done(err);
                                return done();
                            });
                        });
                    });

                    it('should return the raw document', function(done) {
                        model.findOne({ name: 'Demo1' }, { wrap: false }, function(err, doc) {
                            should.not.exist(err);
                            should.exist(doc);
                            doc.should.have.ownProperty('id');
                            doc.should.have.ownProperty('name').and.eql('Demo1');
                            done();
                        });
                    });
                });

                describe('with partial results', function() {
                    before(function(done) {
                        model =  new Model(db, 'model', {
                            name: /.+/,
                            description: String
                        }, {

                        });

                        model.remove(function(err) {
                            if(err) return done(err);

                            model.create({
                                name: 'Demo1',
                                description: 'Demonstration 1'
                            }, function(err, instance) {
                                if(err) return done(err);
                                return done();
                            });
                        });
                    });

                    it('should return just the selected fields', function(done) {
                        model.findOne({ name: 'Demo1' }, { fields: { id: 1, name: 1 }}, function(err, doc) {
                            if(err) return done(err);
                            should.exist(doc);
                            doc.document.should.have.ownProperty('name').and.eql('Demo1');
                            doc.document.should.not.have.ownProperty('description');
                            done();
                        });
                    });

                    it('should set the isPartial flag on its instances', function(done) {
                        model.findOne({ name: 'Demo1' }, { fields: { id: 1, name: 1 }}, function(err, doc) {
                            if(err) return done(err);
                            should.exist(doc);
                            doc.__state.isPartial.should.be.true;
                            done();
                        });
                    });

                    it('should work with wrap: false', function(done) {
                        model.findOne({ name: 'Demo1' }, { wrap: false, fields: { id: 1, name: 1 }}, function(err, doc) {
                            if(err) return done(err);
                            should.exist(doc);
                            doc.should.have.ownProperty('name').and.eql('Demo1');
                            doc.should.not.have.ownProperty('description');
                            done();
                        });
                    });
                });
            });
        });
    });
});
