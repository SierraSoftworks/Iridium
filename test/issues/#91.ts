import * as Iridium from "../../iridium";
import * as chai from "chai";

interface BaseConfigDocument {
  _id?: string
  option1: string
}

@Iridium.Collection('configs')
class BaseConfig<TDoc extends BaseConfigDocument> extends Iridium.Instance<TDoc, BaseConfig<TDoc>> implements BaseConfigDocument {
  @Iridium.ObjectID
  public _id: string

  @Iridium.Property(String)
  public option1: string
}

interface NumberConfigDocument extends BaseConfigDocument {
  option2: number
}

class NumberConfig extends BaseConfig<NumberConfigDocument> {
    @Iridium.Property(Number)
    public option2: number
}

interface StringConfigDocument extends BaseConfigDocument {
  option2: string
}

class StringConfig extends BaseConfig<StringConfigDocument> {
    @Iridium.Property(String)
    public option2: string
}

class Database extends Iridium.Core {
  NumberConfigs = new Iridium.Model<NumberConfigDocument, NumberConfig>(this, NumberConfig);

  StringConfigs = new Iridium.Model<StringConfigDocument, StringConfig>(this, StringConfig);
}

describe("issues", () => {
    let core = new Database({ database: "test" });
    before(() => core.connect());
    after(() => core.close());

    describe("#91", () => {
        it("should allow inserting of a document with the number config", () => {
            return chai.expect(core.NumberConfigs.insert({
                option1: "test",
                option2: 1
            })).to.eventually.be.ok;
        });

        it("should allow inserting of a document with the string config", () => {
            return chai.expect(core.StringConfigs.insert({
                option1: "test",
                option2: "test"
            })).to.eventually.be.ok;
        });
    });
});
