import * as Iridium from "../iridium";

interface UserDoc {
    _id?: string;
    username: string;
    fullname: string;
    email: string;
    dateOfBirth: Date;
    passwordHash: string;
    joined?: Date;
}

@Iridium.Collection("users")
@Iridium.Index({ email: 1 }, { unique: true })
class User extends Iridium.Instance<UserDoc, User> implements UserDoc {
    @Iridium.ObjectID
    _id: string;
    @Iridium.Property(String)
    username: string;
    @Iridium.Property(String)
    fullname: string;
    @Iridium.Property(String)
    email: string;
    @Iridium.Property(Date)
    dateOfBirth: Date;
    @Iridium.Property(String)
    passwordHash: string;
    @Iridium.Property(Date)
    joined: Date;

    changePassword(newPassword: string) {
        this.passwordHash = newPassword.toLowerCase();
    }
    
    static onCreating(doc: UserDoc) {
        doc.joined = new Date();
    }
}

class MyDB extends Iridium.Core {
    Users = new Iridium.Model<UserDoc, User>(this, User);
}

var db = new MyDB("mongodb://localhost/test");

db.connect().then(function () {
    db.Users.insert({
        fullname: "test",
        username: "test",
        passwordHash: "test",
        email: "test@test.com",
        dateOfBirth: new Date()
    }).then(user => {
        user.dateOfBirth.getTime();
    });

    db.Users.insert([{
        fullname: "test",
        username: "test",
        passwordHash: "test",
        email: "test@test.com",
        dateOfBirth: new Date() 
    }]).then(users => {
        users[0].fullname;
    });
    
    db.Users.findOne().then(user => {
        if (!user) throw new Error("User could not be found...");
        user.save().then(user => {
            user.remove().then(user => {
                user.username = "test";
                return user.save();
            });
        });
    });
    
    db.Users.count().then(count => {
        count.toPrecision(2);
    });
});