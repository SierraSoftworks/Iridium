var Iridium = require('../index');

var db = new Iridium({
    database: 'iridium_test'   
});

db.register('Test', new Iridium.Model(db, 'test', {
    name: String,
    birthday: Date
}, {
    virtuals: {
        age: function() { 
            /// <returns type="Number"/>
        }
    },
    methods: {
        greet: function() {
            console.log('Hello!');
        }
    }
}));

var x = new db.Test.Instance({ name: 'test', birthday: new Date() });
x.name.toUpperCase();
x.birthday.toDateString();

db.Test.insert({}, function(err, instance) {
    /// <param name="instance" type="db.Test.Instance"/>
    instance.name = "Demo";
    instance.greet();
});