'use strict';

const QueryResultHandler = artifacts.require("./QueryResultHandler");
const ViewResultCodes = {
  Success: 0,
  NoMatchFound: 1,
  IntegerNotPositive: 2,
  StringEmpty: 3
};

let instance;

contract('validateRow() function test', function() {
  beforeEach('Setup contract for each test', async function() {
    instance = await QueryResultHandler.deployed();
  });

  it("(0,'a'): Should return the StringEmpty code", async () => {
    const viewResultCode = await instance.validateRow.call(0,'a');
    assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
  });

  it("(1,''): Should return the StringEmpty code", async () => {
    const viewResultCode = await instance.validateRow.call(1, '');
    assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
  });

  it("('a',1): should return an error (BigNumber Error: new BigNumber() not a number)", async () => {
    let err = null
    try {
      await instance.validateRow.call("a", 1);
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "new BigNumber() not a number: a", 'BigNumber error was not thrown');
  });

  it("(1,1): Should return the StringEmpty code", async () => {
    const viewResultCode = await instance.validateRow.call(1, 1);
    assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
  });

  it("(1,'a'): Should return the NoMatchFound code", async () => {
    const viewResultCode = await instance.validateRow.call(1, 'a');
    assert.equal(viewResultCode, ViewResultCodes.NoMatchFound, "Returned code was: " + viewResultCode);
  });

  it("(1,'a'): Should return the Success code", async () => {
    instance.storeRow(1, "a");
    const viewResultCode = await instance.validateRow.call(1, 'a');
    assert.equal(viewResultCode, ViewResultCodes.Success, "Returned code was: " + viewResultCode);
  })
})
