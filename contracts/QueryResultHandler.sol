pragma solidity ^0.4.21;

contract QueryResultHandler {

  struct QueryResultStruct {
      bytes32 finalHash;
      bytes32 queryHash;
      bytes32 resultHash;
      uint256 queryId;
      uint256 resultId;
  }

  QueryResultStruct[] queryResultStructArray;

  mapping(uint256=>bytes32[]) idRowArrayMapping;

  event QueryResultStored(
    uint256 queryId,
    uint256 resultId
    );
  event RowStored();
  event Error(string errorMessage);

  enum ViewResultCodes { Success, NoMatchFound, IntegerNotPositive, StringEmpty }
  ViewResultCodes public viewResultCode;

  function storeQueryResults(uint256 _queryId, uint256 _resultId, string _queryString, string _resultString) external returns (bool success) {
    if (_queryId <= 0) {
      emit Error("Query ID must be greater than 0");
      return false;
    }
    if (_resultId <= 0) {
      emit Error("Result ID must be greater than 0");
      return false;
    }
    if (bytes(_queryString).length == 0) {
      emit Error("Query string must be provided");
      return false;
    }
    if (bytes(_resultString).length == 0) {
      emit Error("Result string must be provided");
      return false;
    }

    bytes32 queryHash = keccak256(_queryString);
    bytes32 resultHash = keccak256(_resultString);
    bytes32 finalHash = keccak256(queryHash, resultHash);
    queryResultStructArray.push(QueryResultStruct(finalHash, queryHash, resultHash, _queryId, _resultId));
    emit QueryResultStored(_queryId, _resultId);
    return true;
  }

  function validateQueryResultsById(uint256 _queryId, uint256 _resultId) external view returns (ViewResultCodes result) {
    if (_queryId <= 0) {
      return ViewResultCodes.IntegerNotPositive;
    }
    if (_resultId <= 0) {
      return ViewResultCodes.IntegerNotPositive;
    }
    for (uint i = 0; i < queryResultStructArray.length; i++) {
        if (queryResultStructArray[i].queryId == _queryId
        && queryResultStructArray[i].resultId == _resultId) {
            return ViewResultCodes.Success;
        }
    }
    return ViewResultCodes.NoMatchFound;
  }

  function validateQueryResultsByString(string _queryString, string _resultString) external view returns (ViewResultCodes result) {
    if (bytes(_queryString).length == 0) {
      return ViewResultCodes.StringEmpty;
    }
    if (bytes(_resultString).length == 0) {
      return ViewResultCodes.StringEmpty;
    }
    bytes32 queryHash = keccak256(_queryString);
    bytes32 resultHash = keccak256(_resultString);

    bytes32 finalHash = keccak256(queryHash, resultHash);

    for (uint i = 0; i < queryResultStructArray.length; i++) {
        if (queryResultStructArray[i].finalHash == finalHash) {
            return ViewResultCodes.Success;
        }
    }
    return ViewResultCodes.NoMatchFound;
  }

  function storeRow(uint256 _resultId, string _rowString) external returns (bool success) {
    if (_resultId <= 0) {
      emit Error("Result ID must be greater than 0");
      return false;
    }
    if (bytes(_rowString).length == 0) {
      emit Error("Row string must be provided");
      return false;
    }

    bytes32 rowHash = keccak256(_rowString);
    idRowArrayMapping[_resultId].push(rowHash);
    emit RowStored();
    return true;
  }

  function validateRow(uint256 _resultId, string _rowString) external view returns (ViewResultCodes result) {
    if (_resultId <= 0) {
      return ViewResultCodes.IntegerNotPositive;
    }
    if (bytes(_rowString).length == 0) {
      return ViewResultCodes.StringEmpty;
    }

    bytes32 rowHash = keccak256(_rowString);
    bytes32[] storage dataSet = idRowArrayMapping[_resultId];

    for (uint i = 0; i < dataSet.length; i++) {
      if (dataSet[i] == rowHash) {
        return ViewResultCodes.Success;
      }
    }
    return ViewResultCodes.NoMatchFound;
  }
}
