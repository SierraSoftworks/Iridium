function describe(name, tests) {
	/// <summary>Describes a suit of tests to run</summary>
	/// <param name="name" type="String">The name of the test suit</param>
	/// <param name="test" type="Function">A function to be called to execute the tests</param>

}

describe.skip = describe;
describe.only = describe;

function it(should, test) {
	/// <summary>Describes a test that should pass</summary>
	/// <param name="should" type="String">A description of what the code should do to pass the test</param>
	/// <param name="test" type="Function">A function to be called to execute the test</param>

}

it.skip = it;
it.only = it;

function before(something) {
	/// <summary>Execute a function before the first test in this suit begins</summary>
	/// <param name="something" type="Function">The function to execute</param>

}

function after(something) {
	/// <summary>Execute a function after the last test in this suit ends</summary>
	/// <param name="something" type="Function">The function to execute</param>

}

function beforeEach(something) {
	/// <summary>Execute a function before each test in this suit begins</summary>
	/// <param name="something" type="Function">The function to execute</param>

}

function afterEach(something) {
	/// <summary>Execute a function after each test in this suit ends</summary>
	/// <param name="something" type="Function">The function to execute</param>

}