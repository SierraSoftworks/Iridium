import * as Iridium from "../../iridium";
import * as chai from "chai";
import { ObjectID } from "mongodb";

interface CarDoc {
    make: string;
    model: string;
}

const CarSchema = {
    make: String,
    model: String
}

class Car {
    constructor(doc: CarDoc) {
        this.make = doc.make
        this.model = doc.model
    }

    make: string
    model: string

    toDB() {
        return {
            make: this.make,
            model: this.model
        }
    }
}

interface HouseDoc {
  _id?: string;
  houseName: string;
  cars: CarDoc[]
}

@Iridium.Collection("houses")
class House extends Iridium.Instance<HouseDoc, House> {
  @Iridium.ObjectID
  public _id: string;

  @Iridium.Property(String)
  public houseName: string;

  @Iridium.Property([CarSchema])
  @Iridium.TransformClassList(Car)
  public cars: Car[]
}

class Database extends Iridium.Core {
  Houses = new Iridium.Model<HouseDoc, House>(this, House);
}

describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    beforeEach(() => core.Houses.remove());
    after(() => core.close());

    describe("#118", () => {
        it("should correctly expose the properties", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });

            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });

            chai.expect(house.houseName).to.eql("My House")
            chai.expect(house.cars).to.have.length(1)
            chai.expect(house.cars[0]).to.be.instanceof(Car)
            chai.expect(house.cars[0].make).to.eql("Audi")
            chai.expect(house.cars[0].model).to.eql("A4")
        });

        it("should correctly propagate changes to basic properties", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });

            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });

            house.houseName = "My Other House"
            chai.expect(house.houseName).to.eql("My Other House")
            chai.expect(house.document).to.eql({
                houseName: "My Other House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });
        });

        it("should correctly propagate changes to complex properties when assigned", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });

            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });

            house.cars = [
                new Car({ make: "BMW", model: "325i" })
            ]

            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "BMW", model: "325i" }
                ]
            });
        });

        it("should correctly propagate changes to complex properties when they are modified", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });

            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" }
                ]
            });

            house.cars[0].model = "A6"
            chai.expect(house.cars[0].model).to.eql("A6")

            chai.expect(house.document).to.eql({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A6" }
                ]
            });
        });

        it("should write complex property changes during save", () => {
            const house = new core.Houses.Instance({
                houseName: "My House",
                cars: [
                    { make: "Audi", model: "A4" },
                ]
            });

            house.cars[0].model = "A8"

            return house.save().then(house => {
                chai.expect(house.cars[0].model).to.eql("A8")
            })
            .then(() =>  core.Houses.get(house._id))
            .then(house => {
                chai.expect(house.cars[0].model).to.eql("A8")
            })
        })
    });
});
