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

                        model.create({
                            name: 'Demo2'
                        }, function(err, instance) {
                            if(err) return done(err);
                            return done();
                        });
                    });
                });
            });

            describe('find', function() {
                it('should be able to get all objects', function(done) {
                    model.find(function(err, objs) {
                        if(err) return done(err);
                        should.exist(objs);
                        objs.length.should.equal(2);
                        done();
                    });
                });

                it('should correctly wrap individual objects', function(done) {
                    model.find(function(err, objs) {
                        if(err) return done(err);
                        should.exist(objs);
                        objs.length.should.equal(2);                        
                        objs[0].should.have.property('document');           
                        objs[1].should.have.property('document');
                        done();
                    });
                });

                it('should not throw an error if it couldn\'t find an object', function(done) {
                    model.find({ name: 'NotFound' }, function(err, objs) {
                        if(err) return done(err);
                        should.exist(objs);
                        objs.length.should.equal(0);
                        done();
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

                                model.create({
                                    name: 'Demo2'
                                }, function(err, instance) {
                                    if(err) return done(err);
                                    return done();
                                });
                            });
                        });
                    });

                    it('should correctly be able to find using conditions', function(done) {
                        model.find({ name: 'Demo1' }, function(err, objs) {
                            if(err) return done(err);
                            should.exist(objs);
                            objs[0].should.have.property('name').and.eql('Demo1');
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

                                model.create({
                                    name: 'Demo2'
                                }, function(err, instance) {
                                    if(err) return done(err);
                                    return done();
                                });
                            });
                        });
                    });

                    it('should return the raw document', function(done) {
                        model.find({ name: 'Demo1' }, { wrap: false }, function(err, docs) {
                            should.not.exist(err);
                            should.exist(docs);
                            docs.length.should.equal(1);
                            docs[0].should.have.ownProperty('id');
                            docs[0].should.have.ownProperty('name').and.eql('Demo1');
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
                                description: 'Demo 1'
                            }, function(err, instance) {
                                if(err) return done(err);

                                model.create({
                                    name: 'Demo2',
                                    description: 'Demo 2'
                                }, function(err, instance) {
                                    if(err) return done(err);
                                    return done();
                                });
                            });
                        });
                    });

                    it('should return just the selected fields', function(done) {
                        model.find({ }, { fields: { id: 1, name: 1 }}, function(err, docs) {
                            if(err) return done(err);
                            should.exist(docs);
                            docs.length.should.equal(2);
                            var doc = docs[0];
                            doc.document.should.have.ownProperty('name');
                            doc.document.should.not.have.ownProperty('description');
                            done();
                        });
                    });

                    it('should set the isPartial flag on its instances', function(done) {
                        model.find({ name: 'Demo1' }, { fields: { id: 1, name: 1 }}, function(err, docs) {
                            if(err) return done(err);
                            should.exist(docs);
                            docs.length.should.equal(1);
                            docs[0].__state.isPartial.should.be.true;
                            done();
                        });
                    });

                    it('should work with wrap: false', function(done) {
                        model.find({ name: 'Demo1' }, { wrap: false, fields: { id: 1, name: 1 }}, function(err, docs) {
                            if(err) return done(err);
                            should.exist(docs);
                            docs.length.should.equal(1);
                            docs[0].should.have.ownProperty('name').and.eql('Demo1');
                            docs[0].should.not.have.ownProperty('description');
                            done();
                        });
                    });
                });
            });
        });
    });
});
