import * as Iridium from "../../iridium";
import * as chai from "chai";

interface RunDocument {
  _id?: string
  token: string
}

@Iridium.Collection('runs')
class Run extends Iridium.Instance<RunDocument, Run> implements RunDocument {
  @Iridium.ObjectID
  public _id: string

  @Iridium.Property(String)
  public token: string
}

class Database extends Iridium.Core {
  Runs = new Iridium.Model<RunDocument, Run>(this, Run);
}

describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    after(() => core.close());

    describe("#88", () => {
        it("should allow inserting of a document", () => {
            return chai.expect(core.Runs.insert({
                token: 'test'
            })).to.eventually.be.ok;
        });
    });
});
