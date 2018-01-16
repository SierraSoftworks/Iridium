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

describe("decorators", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    before(() => core.Houses.remove());
    afterEach(() => core.Houses.remove());
    after(() => core.close());

    describe("Rename", () => {
        it("should correctly populate the renames", () => {
            chai.expect(House.renames).to.eql({
                houseName: "house_name"
            })
        })

        it("should correctly expose the correct value during instance instantiation", () => {
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

            return house.save()
                .then(() => core.Houses.collection.findOne({}))
                .then(doc => {
                    chai.expect(doc).to.have.property("house_name", "My House")
                });
        });

        describe("after inserting an entity", () => {
            beforeEach(() => core.Houses.insert({ houseName: "My House" }))

            it("should have inserted the document with the renamed field", () => {
                return chai.expect(core.Houses.collection.findOne({})).to.eventually.have.property("house_name", "My House");
            });

            it("should correctly retrieve the entity", () => {
                return chai.expect(core.Houses.findOne()).to.eventually.have.property("houseName", "My House");
            });

            it("should correctly update the document", () => {
                return core.Houses.findOne().then(house => {
                    chai.expect(house).to.exist;
                    if (!house) throw new Error("House should not be null");

                    house.houseName = "My Other House";
                    return house.save();
                }).then(house => {
                    chai.expect(house).to.have.property("houseName", "My Other House");
                    return core.Houses.findOne();
                }).then(house => {
                    chai.expect(house).to.exist.and.have.property("houseName", "My Other House");
                });
            });
        });
    });
});
