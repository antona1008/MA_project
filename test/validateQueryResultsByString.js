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
    instance.validateQueryResultsByString.call('', '').then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
    });
  });

  it("(a,b): Should return the NoMatchFound code", async () => {
    instance.validateQueryResultsByString.call("a", "b").then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.NoMatchFound, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,a): Should return the StringEmpty code", async () => {
    instance.validateQueryResultsByString.call("a", 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
    });
  });

  it("(a,b): Should return the Success code", async () => {
    instance.storeQueryResults(1, 1, "a", "b");
    instance.validateQueryResultsByString.call("a", "b").then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.Success, "Returned code was: " + viewResultCode);
    });
  });
})
