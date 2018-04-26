'use strict';

const QueryResultHandler = artifacts.require("./QueryResultHandler");
const ViewResultCodes = {
  Success: 0,
  NoMatchFound: 1,
  IntegerNotPositive: 2,
  StringEmpty: 3
};

let instance;

contract('validateQueryResultsByString() function test', function() {
  beforeEach('Setup contract for each test', async function() {
    instance = await QueryResultHandler.deployed();
  });

  it("('',''): Should return the StringEmpty code", async () => {
    let viewResultCode = await instance.validateQueryResultsByString.call('', '');
    assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
  });

  it("('a',''): Should return the StringEmpty code", async () => {
    let viewResultCode = await instance.validateQueryResultsByString.call('a', '');
    assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
  });

  it("(a,b): Should return the NoMatchFound code", async () => {
    let viewResultCode = await instance.validateQueryResultsByString.call("a", "b");
    assert.equal(viewResultCode, ViewResultCodes.NoMatchFound, "Returned code was: " + viewResultCode);
  });

  it("(1,a): Should return the StringEmpty code", async () => {
    let viewResultCode = await instance.validateQueryResultsByString.call("a", 1);
    assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
  });

  it("(a,b): Should return the Success code", async () => {
    instance.storeQueryResults(1, 1, "a", "b");
    let viewResultCode = await instance.validateQueryResultsByString.call("a", "b");
    assert.equal(viewResultCode, ViewResultCodes.Success, "Returned code was: " + viewResultCode);
  });
})
