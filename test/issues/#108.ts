import * as Iridium from "../../iridium";
import * as chai from "chai";
import { ObjectID } from "mongodb";

interface HouseDoc {
  _id?: string
  houseName: string
}

@Iridium.Collection("houses")
class House extends Iridium.Instance<HouseDoc, House> {
  @Iridium.ObjectID
  public _id: string;

  @Iridium.Property(String)
  @Iridium.Rename("house_name")
  public houseName: string;
}

class Database extends Iridium.Core {
  Houses = new Iridium.Model<HouseDoc, House>(this, House);
}

describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    beforeEach(() => core.Houses.remove());
    after(() => core.close());

    describe("#108", () => {
        it("should correctly populate the renames", () => {
            chai.expect(House.renames).to.eql({
                houseName: "house_name"
            })
        })

        it("should correctly expose the correct house name on an instance", () => {
            const house = new core.Houses.Instance({
                houseName: "My House"
            });

            chai.expect(house.document).to.eql({
                houseName: "My House"
            });

            chai.expect(house.houseName).to.eql("My House")
            house.houseName = "My Other House"

            chai.expect(house.document).to.eql({
                houseName: "My Other House"
            });
        });

        it("should correctly save the field in the DB", () => {
            const house = new core.Houses.Instance({
                houseName: "My House"
            });

            return house.save().then(() => {
                return core.Houses.collection.findOne({}).then(doc => {
                    chai.expect(doc).to.have.property("house_name", "My House")
                });
            });
        });

        it("should correctly insert the document", () => {
            return core.Houses.insert({
                houseName: "My House"
            }).then(house => {
                chai.expect(house.houseName).to.eql("My House")
                return core.Houses.collection.findOne({}).then(doc => {
                    chai.expect(doc).to.have.property("house_name", "My House")
                });
            });
        });

        it("should correctly retrieve the document", () => {
            return core.Houses.insert({
                houseName: "My House"
            }).then(house => {
                chai.expect(house.houseName).to.eql("My House")
                return core.Houses.findOne().then(doc => {
                    chai.expect(doc).to.have.property("houseName", "My House")
                });
            });
        });
    });
});
