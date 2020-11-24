$(document).ready(function () { 
    td_id = 0;

    id = getUrlParameter('id');
    type = getUrlParameter('type');
    name = getUrlParameter('name');
    $("#title-editing").html("Itens "+name);
    $("#"+type+"-nav").addClass("selected");

    var currentInfo;
    var existingTopics;

    var token = localStorage.getItem("token");
    var firstLoad = true;

    $.ajax({
        url: "http://localhost:8083/api/rule/list-all",
        type: 'GET',
        secure: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        success: function (data){
            currentInfo = data.content;
            openSuccess();
            setTimeout(function(){
            closeSuccess();
            }, 2000);
            getInspectionTopics();
            
        },
        error: function(xhr, status, error) {
            openError(xhr);
        },
    });

    //Pegar os Itens q ja existem na Inspection
    function getInspectionTopics(){
        $.ajax({
            url: "http://localhost:8083/api/topic/inspection/" + id,
            type: 'GET',
            secure: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            success: function (data){
                openSuccess();
                setTimeout(function(){
                closeSuccess();
                }, 2000);
                existingTopics = data.topics;


                if(firstLoad){
                    currentInfo.forEach(createRule);
                    firstLoad = false;
                }
            },
            error: function(xhr, status, error) {
                openError(xhr);
            },
        });
    }

    //Criando options no select para as Rules
    function createRule(item){
        var selectElement = document.getElementsByClassName("inputRules")[0];

        var newOpt = document.createElement("option");
        newOpt.setAttribute("value", item.id);
        newOpt.innerHTML = item.title;

        selectElement.appendChild(newOpt);
    }

    
    //Carregar itens ao clicar na Rule
    $(".inputRules").change(function(){

        getInspectionTopics();


        var ruleId = $(this).val();
        if(ruleId == "placehold")
            return 0;
        $("tbody").empty();

        $.ajax({
            url: "http://localhost:8083/api/item/rule/" + ruleId,
            type: 'GET',
            secure: true,
            headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
            },
            success: function (data){
                currentInfo = data;
                var infos = data.items;
                infos.forEach(createItem);
                openSuccess();
                setTimeout(function(){
                    closeSuccess();
                }, 2000);
                },
            error: function(xhr, status, error) {
            openError(xhr);
        },
        });

    });

    //Criando items da Rule Selecionada
    function createItem(item, index){
        var tableBody = document.getElementsByTagName("tbody")[0];

        var newElement = document.createElement("tr");
        newElement.setAttribute("id", index);
        

        var tableTD = document.createElement("td");

        var tdDiv = document.createElement("div");
        tdDiv.setAttribute("class", "row");

        var rowDiv2 = document.createElement("div");
        rowDiv2.setAttribute("class", "col-8");
        rowDiv2.innerHTML = item.title;

        var tableTD2 = document.createElement("td");
        var tdA = document.createElement("div");
        var aSpan = document.createElement("span");
        aSpan.setAttribute("itemId", item.id);

        var exists = 0;
        //Verifica se é igual a algum id dos topics
        for(var i = 0; i < existingTopics.length; i++){
            if(item.id == existingTopics[i].item.id){
                exists = true;
                aSpan.setAttribute("topicid", existingTopics[i].id);
                break;
            }
        }
        aSpan.setAttribute("checkState", exists);

        if(exists)
            aSpan.setAttribute("class", "far fa-check-circle fa-lg checkBox");
        else
            aSpan.setAttribute("class", "far fa-circle fa-lg checkBox");
            

        tdA.appendChild(aSpan);
        tableTD2.appendChild(tdA);

        tdDiv.appendChild(rowDiv2);

        tableTD.appendChild(tdDiv);

        newElement.appendChild(tableTD);
        newElement.appendChild(tableTD2);

        var more = document.getElementById("more");
        tableBody.insertBefore(newElement, more);
    }

    //Evento ao clicar na CheckBox
    $("tbody").on("click", ".checkBox", function() {
        var checkedState = $(this).attr("checkState");
        if(checkedState == 0){
            $(this).attr("class", "far fa-check-circle fa-lg checkBox");
            $(this).attr("checkState", 1);

            var dataToSend = {
                inspection: {
                    id: id
                },
                printInReport: true,
                positionIndex: $(".checkBox").index(this),
                item: {
                    id: $(this).attr("itemId")
                }
            }

            var dataString = JSON.stringify(dataToSend);

            //$(this) nao funciona dentro do ajax
            var currentElement = $(this);

            $.ajax({
                url: "http://localhost:8083/api/topic",
                type: 'POST',
                secure: true,
                data: dataString,
                headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
                },
                success: function (data){
                    currentElement.attr("topicid", data.id);

                    existingTopics.push({
                        id: data.id, 
                        item: {
                            id: currentElement.attr("itemId")
                        }
                    });

                    openSuccess();
                    setTimeout(function(){
                        closeSuccess();
                    }, 2000);
                    },
                error: function(xhr, status, error) {
                    openError(xhr);
                },
            });

        } else {
            $(this).attr("class", "far fa-circle fa-lg checkBox");
            $(this).attr("checkState", 0);

            var toBeDeleted = $(this).attr("topicid");

            $.ajax({
                url: "http://localhost:8083/api/topic/" + toBeDeleted,
                type: 'DELETE',
                secure: true,
                headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
                },
                success: function (data){
                    openSuccess();
                    setTimeout(function(){
                        closeSuccess();
                    }, 2000);
                    },
                error: function(xhr, status, error) {
                    openError(xhr);
                },
            });
        }
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