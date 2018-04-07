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
    instance.validateQueryResultsById.call(0, 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,0): Should return the IntegerNotPositive code", async () => {
    instance.validateQueryResultsById.call(1, 0).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
    });
  });

  it("('a',1): Should return the IntegerNotPositive code", async () => {
    instance.validateQueryResultsById.call("a", 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
    });
  });

  it("('[a,b],1): Should return the IntegerNotPositive code", async () => {
    instance.validateQueryResultsById.call(['a','b'], 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,1): Should return the NoMatchFound code", async () => {
    instance.validateQueryResultsById.call(1, 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.NoMatchFound, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,1): Should return the Success code", async () => {
    instance.storeQueryResults(1, 1, "a", "b");
    instance.validateQueryResultsById.call(1, 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.Success, "Returned code was: " + viewResultCode);
    });
  });
});
