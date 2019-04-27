"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Iridium = require("../../iridium");
const chai = require("chai");
let User = class User extends Iridium.Instance {
};
__decorate([
    Iridium.ObjectID
], User.prototype, "_id", void 0);
__decorate([
    Iridium.Property(String)
], User.prototype, "name", void 0);
User = __decorate([
    Iridium.Collection('users')
], User);
class Database extends Iridium.Core {
    constructor() {
        super(...arguments);
        this.Users = new Iridium.Model(this, User);
    }
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
//# sourceMappingURL=#110.js.map