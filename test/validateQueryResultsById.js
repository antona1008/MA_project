'use strict';

const QueryResultHandler = artifacts.require("./QueryResultHandler");
const ViewResultCodes = {
  Success: 0,
  NoMatchFound: 1,
  IntegerNotPositive: 2,
  StringEmpty: 3
};

let instance;

contract('validateQueryResultsById() function test', function() {
  beforeEach('Setup contract for each test', async function() {
    instance = await QueryResultHandler.deployed();
  });

  it("(0,1): Should return the IntegerNotPositive code", async () => {
    let viewResultCode = await instance.validateQueryResultsById.call(0, 1);
    assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
  });

  it("(1,0): Should return the IntegerNotPositive code", async () => {
    let viewResultCode = await instance.validateQueryResultsById.call(1, 0);
    assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
  });

  it("('a',1): Should return an error (BigNumber Error: new BigNumber() not a number", async () => {
    let err = null
    try {
      await instance.validateQueryResultsById.call("a", 1);
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "new BigNumber() not a number: a", 'BigNumber error was not thrown');
  });

  it("('[a,b],1): Should return an error (BigNumber Error: new BigNumber() not a number", async () => {
    let err = null
    try {
      await instance.validateQueryResultsById.call(['a','b'], 1);
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "new BigNumber() not a number: a,b", 'BigNumber error was not thrown');
  });

  it("(1,1): Should return the NoMatchFound code", async () => {
    let viewResultCode = await instance.validateQueryResultsById.call(1, 1);
    assert.equal(viewResultCode, ViewResultCodes.NoMatchFound, "Returned code was: " + viewResultCode);
  });

  it("(1,1): Should return the Success code", async () => {
    instance.storeQueryResults(1, 1, "a", "b");
    let viewResultCode = await instance.validateQueryResultsById.call(1, 1);
    assert.equal(viewResultCode, ViewResultCodes.Success, "Returned code was: " + viewResultCode);
  });
});
