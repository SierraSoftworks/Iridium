import * as Iridium from "../../iridium";
import * as chai from "chai";

interface UserDoc {
  _id?: string
  name: string
}

@Iridium.Collection('users')
class User extends Iridium.Instance<UserDoc, User> implements UserDoc {
  @Iridium.ObjectID
  public _id: string

  @Iridium.Property(String)
  public name: string
}

class Database extends Iridium.Core {
  Users = new Iridium.Model<UserDoc, User>(this, User);
}

describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    beforeEach(() => core.Users.remove());
    after(() => core.close());

    describe("#110", () => {
        it("should allow a new instance with the initial document", () => {
            const user = new core.Users.Instance({
                name: "First User"
            });

            return user.save().then(() => {
                chai.expect(user.name).to.eql("First User");

                return core.Users.get().then(retrievedUser => {
                    chai.expect(retrievedUser).to.exist;
                    chai.expect(retrievedUser.name).to.eql("First User");
                });
            });
        });

        it("should allow a new instance with modifications", () => {
            const user = new core.Users.Instance({
                name: "First User"
            });

            user.name = "changed name before saved";

            return user.save().then(() => {
                chai.expect(user.name).to.eql("changed name before saved");

                return core.Users.get().then(retrievedUser => {
                    chai.expect(retrievedUser).to.exist;
                    chai.expect(retrievedUser.name).to.eql("changed name before saved");
                });
            });
        });
    });
});
