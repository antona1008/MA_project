App = {
  web3Provider: null,
  contracts: {},
  resultArray: [],
  resultId: 1234,
  queryId: null,
  queryString: null,

  init: function() {
    App.enterTestData();
    return App.initWeb3();
  },

  enterTestData: function() {
    App.readCSV('example_result.csv', true);
    App.readJSON('example_query.json', true);
    $('#resultIdInput').attr('value', App.resultId);
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('QueryResultHandler.json', function(data) {
      var QueryResultArtifact = data;
      App.contracts.QueryResultHandler = TruffleContract(QueryResultArtifact);
      App.contracts.QueryResultHandler.setProvider(App.web3Provider);
      App.listenForEvents();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#storeButton', App.storeInput);
    $(document).on('click', '#validateStringButton', App.validateString);
    $(document).on('click', '#validateIDButton', App.validateID);
  },

  listenForEvents: function() {
    App.contracts.QueryResultHandler.deployed().then(function(instance) {
      instance.RowStored({}, {
        fromBlock: 0,
        toBlock: 'latemp'
      }).watch(function(error, event) {
        //console.log("event triggered", event)
        //thsi enables to watch events emitted by the smart contract
      });
    });
  },

  readJSON: function(input, isInitialRendering) {
    $.ajax({
      type: "GET",
      url: input,
      dataType: "json",
      success: function(data) {
        if ($.isNumeric(data.id)) {
          queryId = data.id;
          $('#queryIdInput').attr('value', queryId);
        };
        queryString = JSON.stringify(data.request);
        $('#queryStringInput').html(queryString);
      },
      error: function(xhr, status, error) {
        var err = eval("(" + xhr.responseText + ")");
        console.log(err.Message);
      }
    })
  },

  readCSV: function(input, isInitialRendering) {
    $.ajax({
      type: "GET",
      url: isInitialRendering ? input : fileInput.files[0],
      dataType: "text",
      success: function(data) {
        resultArray = data.replace(/\n/g, " ").split(" ");
        $('#resultStringInput').html(resultArray);
      }
    });
  },

  storeInput: function(event) {
    App.getStoreInputData();
    var contractInstance;
    App.contracts.QueryResultHandler.deployed().then(function(instance) {
      contractInstance = instance;
      return instance.storeQueryResults(
        App.queryId,
        App.resultId,
        App.queryString,
        JSON.stringify(App.resultArray), {
          from: web3.eth.accounts[0],
          gas: 3000000
        });
    }).then(function(success) {
      return getResultList();
    }).then(function(values) {
      alert("The values are stored successfully.");
      console.log(values);
    }).catch(function(err) {
      alert(err.message);
    });
    var getResultList = async function() {
      const allPromises = App.resultArray.map((row) => (
          contractInstance.storeRow(App.resultId, row, {
            from: web3.eth.accounts[0],
            gas: 3000000
          }))
        .then(result => ({
          result,
          row
        }))
      );
      const resultList = await Promise.all(allPromises);
      return resultList;
    }
  },

  validateString: function(event) {
    App.getValidateStringInputData();
    var contractInstance;
    App.contracts.QueryResultHandler.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.validateQueryResultsByString.call(
        App.queryString,
        JSON.stringify(App.resultArray)
      );
    }).then(function(resultCode) {
      switch (resultCode.toNumber()) {
        case 0: alert("The given strings are valid.");
          break;
        case 1: alert("The rows will be validated one by one. Please wait.")
          return getResultList();
        case 3: alert("The query and the result set have to be provided.")
          break;
      }
    }).then(function(values) {
      if (typeof values !== 'undefined') {
        console.log(values);
        var match = [];
        var noMatch = [];
        var emptyRow = [];
        var wrongID = false;
        values.forEach(function(element){
          switch (element.result.toNumber()) {
            case 0: match.push(element.row);
              break;
            case 1: noMatch.push(element.row);
              break;
            case 2: wrongID = true;
              break;
            case 3: emptyRow.push(element.row);
              break;
          }
        });
        console.log(match);
        if (wrongID){
          alert ("The result set ID has to be greater than 0.");
        } else {
          alert("The row(s) that do not match: " + noMatch +", number of empty rows provided: " + emptyRow.length);
        }
        return values;
      }
    }).catch(function(err) {
      alert(err.message);
    })
    var getResultList = async function() {
      const allPromises = App.resultArray.map((row) => (
        contractInstance.validateRow.call(App.resultId, row)
        .then(result => ({
          result,
          row
        }))
      ));
      const resultList = await Promise.all(allPromises);
      return resultList;
    }
  },

  validateID: function() {
    App.getValidatIDInputData();
    var contractInstance;
    App.contracts.QueryResultHandler.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.validateQueryResultsById.call(
        App.queryId,
        App.resultId
      );
    }).then(function(resultCode) {
      switch (resultCode.toNumber()) {
        case 0: alert("The given IDs are valid.");
          break;
        case 1: alert("No match was found.")
          break;
        case 2: alert("IDs have to be greater than 0.")
          break;
      }
    }).catch(function(err) {
      alert(err.message);
    })
  },

  getStoreInputData: function() {
    App.queryId = $('#queryIdInput').val();
    App.queryString = $('#queryStringInput').val();
    App.resultId = $('#resultIdInput').val();

    var resultString = $('#resultStringInput').val();
    var temp = resultString.split("\n");
    App.resultArray = [];
    for (var x in temp) {
      App.resultArray.push(temp[x]);
    };
  },

  getValidateStringInputData: function() {
    App.queryString = $('#queryStringInputValidateString').val();
    App.resultId = $('#resultIdInputValidateString').val();

    var resultString = $('#resultStringInputValidateString').val();
    var temp = resultString.split("\n");
    App.resultArray = [];
    for (var x in temp) {
      App.resultArray.push(temp[x]);
    };
  },

  getValidatIDInputData: function() {
    App.queryId = $('#queryIdInputValidateID').val();
    App.resultId = $('#resultIdInputValidateID').val();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
