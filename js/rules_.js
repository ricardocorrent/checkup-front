$(document).ready(function () {
    var token = localStorage.getItem("token");
    console.log(token);
    $.ajax({
      url: "http://localhost:8083/api/rule/list-all",
      type: 'GET',
      secure: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      success: function (data){
        console.log(data.content);
        var rules = data.content;
        rules.forEach(createRule);

        openSuccess();
          setTimeout(function(){
            closeSuccess();
          }, 2000);
        },
        error: function(xhr, status, error) {
          openError(xhr);
        }
  });

 

  //Criar uma nova Rule
  $("#addMore").on("click", function(){
    if(document.getElementById("index").value.trim() != "" && document.getElementById("desc").value.trim() != ""){
      var content = document.getElementById("index").value.trim();
      var descriptionContent = document.getElementById("desc").value.trim();
      console.log(content);
      console.log(descriptionContent);
      var newRule = {
        title: content,
        description: descriptionContent,
        active: true
      };

        var dataString = JSON.stringify(newRule);

        $.ajax({
          url: "http://localhost:8083/api/rule",
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
  
  //Criar um elemento de rule
  function createRule(item, index){

    var tableBody = document.getElementsByTagName("tbody")[0];
    
    var newElement = document.createElement("tr");
    newElement.setAttribute("id", index);
    

    var tableTD = document.createElement("td");

    var tdDiv = document.createElement("div");
    tdDiv.setAttribute("class", "row");
   
   /* var rowDiv1 = document.createElement("div");
    rowDiv1.setAttribute("class", "col-2");
    
  var divSpan = document.createElement("span");
    if(item.active){
      divSpan.setAttribute("class", "fa fa-check-circle fa-lg");
      divSpan.style.color = "darkgreen";
    } else {
      divSpan.setAttribute("class", "fa fa-times-circle fa-lg");
      divSpan.style.color = "red";
    }*/

    var rowDiv2 = document.createElement("div");
    rowDiv2.setAttribute("class", "col-12");
    rowDiv2.innerHTML = item.title;

    
    var tableTD2 = document.createElement("td");
    var tdDiv2 = document.createElement("div");
    tdDiv2.setAttribute("class", "row");
    var rowDiv3 = document.createElement("div");
    rowDiv3.setAttribute("class", "col-12");
    rowDiv3.innerHTML = item.description;


    var tableTD3 = document.createElement("td");
    var tdA = document.createElement("a");
    tdA.setAttribute("href", "edit_.html?id=" + item.id + "&type=rules&name=" + item.title);
    var aSpan = document.createElement("span");
    aSpan.setAttribute("class", "fa fa-edit fa-lg");


    var tableTD4 = document.createElement("td");
    var tdA2 = document.createElement("a");
    tdA2.setAttribute("href", "items_.html?ruleid=" + item.id + "&name=" + item.title);
    var aSpan2 = document.createElement("span");
    aSpan2.setAttribute("class", "fa fa-list-ul fa-lg");

    var tableTD5 = document.createElement("td");
    var tdA3 = document.createElement("a");
    tdA3.setAttribute("href","#");
    var aSpan3 = document.createElement("span");
    aSpan3.setAttribute("class", "fas fa-minus-circle fa-lg delete");
    aSpan3.setAttribute("id",item.id);
    

    tdA.appendChild(aSpan);
    tableTD3.appendChild(tdA);

    tdA2.appendChild(aSpan2);
    tableTD4.appendChild(tdA2);

    tdA3.appendChild(aSpan3);
    tableTD5.appendChild(tdA3);

  //  rowDiv1.appendChild(divSpan);
    //tdDiv.appendChild(rowDiv1);
    tdDiv.appendChild(rowDiv2);

    tdDiv2.appendChild(rowDiv3);

    tableTD.appendChild(tdDiv);
    tableTD2.appendChild(tdDiv2);

    newElement.appendChild(tableTD);
    newElement.appendChild(tableTD2);
    newElement.appendChild(tableTD3);
    newElement.appendChild(tableTD4);
    newElement.appendChild(tableTD5);

    var more = document.getElementById("more");
    tableBody.insertBefore(newElement, more);
  }

  //Delete rules
  $("tbody").on("click", ".delete", function(data) {
    var ruleId = data.target.id;

    $.ajax({
      url: "http://localhost:8083/api/rule/" + ruleId,
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