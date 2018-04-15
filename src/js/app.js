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
    //TODO:
    $('#resultFile').bind(
      'change',
      function() {
        App.readCSV('#resultFile', '#resultStringInput', false)
      });
    $('#queryFile').bind('change', function() {
      App.readJSONAfterRendering();
    });
  },

  listenForEvents: function() {
    App.contracts.QueryResultHandler.deployed().then(function(instance) {
      instance.RowStored({}, {
        fromBlock: 0,
        toBlock: 'latemp'
      }).watch(function(error, event) {
        //console.log("event triggered", event)
        //egy view function, ami megmondja, hany record van tarolva egy id-hoz
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

  readJSONAfterRendering: function() {
    var reader = new FileReader();
    reader.onload = function() {
      var data = JSON.parse(reader.result);

      if (typeof data.id != 'undefined') {
        console.log(data.id);
        App.queryId = data.id;
        $('#queryIdInput').attr('value', data.id);
      } else {
        alert("Input does not contain ID!");
      }

      if (typeof data.request != 'undefined') {
        console.log(data.request);
        App.queryString = JSON.stringify(data.request);
        $('#queryStringInput').html(JSON.stringify(data.request));
      } else {
        alert("Input does not contain request!");
      }
    }

    var fileInput = document.getElementById("queryFile");
    reader.readAsText(fileInput.files[0]);
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
      console.log(values);
      return values;
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
      console.log("the result code  " + resultCode);
      if (resultCode == 1) {
        return getResultList();
      }
    }).then(function(values) {
      console.log("values: " + JSON.stringify(values));
      return values;
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
      console.log("the result code  " + resultCode);
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
