describe('bugs', function () {
    "use strict";
    var db = new Database(config);

    before(function () {
        return db.connect();
    });

    after(function() {
        return db.disconnect();
    });

    it("shouldn't attempt to change an ObjectID when saving an instance", function() {
        var model = new Model(db, 'model', {
            id: false,
            data: [String]
        }, {

        });

        return model.remove().then(function() {
            return model.create({ data: ['testing'] });
        }).then(function(instance) {
            instance.data.push('tested');
            return instance.save();
        }).then(function(instance) {
            instance.data.should.be.like(['testing', 'tested']);
        });
    });
});