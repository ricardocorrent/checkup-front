$(document).ready(function () {
    var amount = 0;
    var token = localStorage.getItem("token");
    console.log(token);
    $.ajax({
      url: "http://localhost:8083/api/target/list-all",
      type: 'GET',
      secure: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      success: function (data){
        console.log(data.content);
        var targets = data.content;
        targets.forEach(createTarget);

        openSuccess();
        setTimeout(function(){
          closeSuccess();
        }, 2000);
      },
      error: function(xhr, status, error) {
        openError(xhr);
      }
  });
  
  //Adicionar nova target
  $("#addMore").on("click", function(){
    var content = document.getElementById("index").value.trim();
    console.log(content);
    if(content != ""){
      var newTarget = {
        name: content,
        active: true
      };

      var dataString = JSON.stringify(newTarget);

      $.ajax({
        url: "http://localhost:8083/api/target",
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
          }, 2000);
          setTimeout(function(){
            location.reload();
          }, 2700);
        },
        error: function(xhr, status, error) {
          openError(xhr);
        }
      });
    }
  });
  
  //Funcao para criar cada target
  function createTarget(item){

    var tableBody = document.getElementsByTagName("tbody")[0];
    
    var newElement = document.createElement("tr");
    newElement.setAttribute("id", amount);
    

    var tableTD = document.createElement("td");

    var tdDiv = document.createElement("div");
    tdDiv.setAttribute("class", "row");
    var rowDiv1 = document.createElement("div");
    rowDiv1.setAttribute("class", "col-2");
    var divSpan = document.createElement("span");

    //Tipo de Checkmark
    if(item.active){
      divSpan.setAttribute("class", "fa fa-check-circle fa-lg");
      divSpan.style.color = "darkgreen";
    } else {
      divSpan.setAttribute("class", "fa fa-times-circle fa-lg");
      divSpan.style.color = "red";
    }

    var rowDiv2 = document.createElement("div");
    rowDiv2.setAttribute("class", "col-8");
    rowDiv2.innerHTML = item.name;

    var tableTD2 = document.createElement("td");
    var tdA = document.createElement("a");
    tdA.setAttribute("href", "edit_.html?id=" + item.id + "&type=target&name=" + item.name);
    var aSpan = document.createElement("span");
    aSpan.setAttribute("class", "fa fa-edit fa-lg");

    var tableTD3 = document.createElement("td");
    var tdA2 = document.createElement("a");
    tdA2.setAttribute("href","#");
    var aSpan1 = document.createElement("span");
    aSpan1.setAttribute("class", "fas fa-minus-circle fa-lg delete");
    aSpan1.setAttribute("id",item.id);
    
    

    tdA.appendChild(aSpan);
    tableTD2.appendChild(tdA);

    tdA2.appendChild(aSpan1);
    tableTD3.appendChild(tdA2);

    rowDiv1.appendChild(divSpan);
    tdDiv.appendChild(rowDiv1);
    tdDiv.appendChild(rowDiv2);

    tableTD.appendChild(tdDiv);

    newElement.appendChild(tableTD);
    newElement.appendChild(tableTD2); 
    newElement.appendChild(tableTD3);

    var more = document.getElementById("more");
    tableBody.insertBefore(newElement, more);

    amount++;
  }

    //Delete Target
    $("tbody").on("click", ".delete", function(data) {
      var targetId = data.target.id;
  
      $.ajax({
        url: "http://localhost:8083/api/target/" + targetId,
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