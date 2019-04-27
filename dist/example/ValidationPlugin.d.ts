import Iridium = require("../iridium");
import Skmatc = require("skmatc");
declare class StringCaseValidationPlugin implements Iridium.Plugin {
    validate: Skmatc.Validator[];
}
export = StringCaseValidationPlugin;
