$(document).ready(function () { 
    td_id = 0;
    
    //Adicionar uma linha nova para novo Item
    $("#moreLine").on("click", function () {
        addEmptyField();
        flags.push(2); //Marcando elemento como novo Item
    });

    ruleid = getUrlParameter('ruleid');
    type = getUrlParameter('type');
    name = getUrlParameter('name');
    $("#title-editing").html("Edit "+name);
    $("#"+type+"-nav").addClass("selected");

    var currentInfo;
    var flags = [];

    var token = localStorage.getItem("token");

    $.ajax({
      url: "http://localhost:8083/api/rule/ " + ruleid + "/items",
      type: 'GET',
      secure: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      success: function (data){
        emptyFlags(data.length);
        currentInfo = data;
        data.forEach(createInformation);
        openSuccess();
        setTimeout(function(){
          closeSuccess();
        }, 2000);
      },
      error: function(xhr, status, error) {
        openError(xhr);
      }
    });

    //Zerando todos valores das flags
    function emptyFlags(flagCount){
      for(var i = 0; i < flagCount; i++){
        flags.push(0);
      }
    }

    //Update quando clicar submit
    $("#updateValues").on("click", function () {

      var newInfo = [];
      for(var i = 0; i < td_id; i++){

        //Pegando valores do html
        var fieldVal = document.getElementsByClassName("field_1")[i].value.trim();
        var contentVal = document.getElementsByClassName("field_2")[i].value.trim();
      
        //Colocando valores em um novo array
        //Normal para update
        if(flags[i] != 2){
          newInfo.push({
            id: currentInfo[i].id,
            title: fieldVal,
            description: contentVal,
            positionIndex: i,
            active: true,
            rule: {
              id: ruleid
            },
            information: currentInfo[i].information
          });
        } else { //Diferente para Create
          newInfo.push({
            title: fieldVal,
            description: contentVal,
            positionIndex: i,
            active: true,
            rule: {
              id: ruleid
            }
          });
        }
        
        //Mudando a flag caso o valor esteja diferente do inicial
        if(flags[i] == 2){
          console.log("Novo");
        } else if(fieldVal != currentInfo[i].title || contentVal != currentInfo[i].description){
          flags[i] = 1;
        } else {
          flags[i] = 0;
        }
      }

      //Update para cada elemento com Flag = 1
      for(var i = 0; i < td_id; i++){

        if(flags[i] == 1){ //Verifica se é um Item alterado, Flag = 1
          var dataString = JSON.stringify(newInfo[i]);
          console.log("entrei");
          $.ajax({
            url: "http://localhost:8083/api/item/" + newInfo[i].id,
            type: 'PUT',
            data: dataString,
            secure: true,
            headers: {
              "Authorization": "Bearer " + token,
              "Content-type": "application/json"
            },
            success: function (data){
              openSuccess();
              setTimeout(function(){
                closeSuccess();
              }, 2000);
              location.reload();
            },
            error: function(xhr, status, error) {
              openError(xhr);
            }
          });
        } else if(flags[i] == 2){ //Verifica se é um novo Item, Flag = 2
          var dataString = JSON.stringify(newInfo[i]);
          $.ajax({
            url: "http://localhost:8083/api/item/",
            type: 'POST',
            data: dataString,
            secure: true,
            headers: {
              "Authorization": "Bearer " + token,
              "Content-type": "application/json"
            },
            success: function (data){
              openSuccess();
              setTimeout(function(){
                closeSuccess();
                location.reload();
              }, 2000);
            },
            error: function(xhr, status, error) {
              openError(xhr);
            }
          });
        }
      }
  });

  //Adicionando cada elemento do array
  function createInformation(item, index){

    td_id++;

    var tableBody = document.getElementsByTagName("tbody")[0];
    var newElement = document.createElement("tr");
    newElement.setAttribute("id", td_id);

    var tableTD1 = document.createElement("td");
    var tableTD2 = document.createElement("td");
    var tableTD3 = document.createElement("td");

    var inputTD1 = document.createElement("input");
    inputTD1.setAttribute("class", "field_1");
    inputTD1.setAttribute("type", "text");
    inputTD1.setAttribute("value", item.title);

    var inputTD2 = document.createElement("textarea");
    inputTD2.setAttribute("class", "field_2");
    inputTD2.setAttribute("type", "text");
    // inputTD2.setAttribute("value", item.description);
    inputTD2.value = item.description;
    
    var tdA2 = document.createElement("a");
    tdA2.setAttribute("href","#");
    tdA2.setAttribute("class","remItem");
    tdA2.setAttribute("value", item.id);
    var removeIcon = document.createElement("li");
    removeIcon.setAttribute("class", "fas fa-minus-circle");

  
    
    

    tdA2.appendChild(removeIcon);



    tableTD1.appendChild(inputTD1);
    tableTD2.appendChild(inputTD2);
    tableTD3.appendChild(tdA2);

    newElement.appendChild(tableTD1);
    newElement.appendChild(tableTD2);
    newElement.appendChild(tableTD3);

    var more = document.getElementById("more");
    tableBody.insertBefore(newElement, more);
  }

  //Funcao para adicionar um espaco em branco
  function addEmptyField(){
    td_id += 1; 
    fields = td_id * 2;

    var tableBody = document.getElementsByTagName("tbody")[0];
    var newElement = document.createElement("tr");
    newElement.setAttribute("id", td_id);
    
    var tableTD1 = document.createElement("td");
    var tableTD2 = document.createElement("td");
    
    var inputTD1 = document.createElement("input");
    inputTD1.setAttribute("class", "field_1");
    inputTD1.setAttribute("type", "text");
    
    var inputTD2 = document.createElement("textarea");
    inputTD2.setAttribute("class", "field_2");
    inputTD2.setAttribute("type", "text");
    
    tableTD1.appendChild(inputTD1);
    tableTD2.appendChild(inputTD2);
    
    newElement.appendChild(tableTD1);
    newElement.appendChild(tableTD2);

    var more = document.getElementById("more");
    tableBody.insertBefore(newElement, more);
  }


  //Remover Item
  $("tbody").on("click", ".remItem", function(e) {
    e.preventDefault();
    //ID do item  
    var itemToBeRemovedId = $(this).attr("value");

    $.ajax({
      url: "http://localhost:8083/api/item/" + itemToBeRemovedId,
      type: 'DELETE',
      secure: true,
      headers: {
        "Authorization": "Bearer " + token,
        "Content-type": "application/json"
      },
      success: function (data){
        openSuccess();
        setTimeout(function(){
          closeSuccess();
        }, 2000);
        setTimeout(function(){
          location.reload();
      }, 2700);
      },
      error: function(xhr, status, error) {
        openError(xhr);
      }
    });

  });

  //Request Response code
  
  $(".closeError").mousedown(function(){
    closeError();
  });
  $(".openCloseError").mousedown(function(){
    expandError();
  });
  function openSuccess(){
    $(".successMsg").css("left", "0px");
  }
  function closeSuccess(){
    $(".successMsg").css("left", "-350px");
  }
  function openError(errorData){
    $(".errorMsg").css("left", "0px");
    $(".errorStatus").text("Error: " + errorData.status);
    $(".botError").text(JSON.stringify(errorData.responseJSON, null, 2));
  }
  var errorExpand = false;
  function expandError(){
    if(errorExpand){
      $(".errorMsg").css("height", "75px");
      $(".openCloseError").css("transform", "rotateZ(0deg)")
      errorExpand = false;  
    } else {
      $(".errorMsg").css("height", "280px");
      $(".openCloseError").css("transform", "rotateZ(180deg)")
      errorExpand = true;      
    }
  }
  function closeError(){
    $(".errorMsg").css("height", "75px");
    $(".errorMsg").css("left", "-350px");
    $(".openCloseError").css("transform", "rotateZ(0deg)")
    errorExpand = false; 
  }
  //End of Response Code

}); 
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};