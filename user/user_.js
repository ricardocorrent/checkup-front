$(document).ready(function () {
    td_id = 0;

    //Adicionando nova linha
    $("#moreLine").on("click", function () {
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

        var inputTD2 = document.createElement("input");
        inputTD2.setAttribute("class", "field_2");
        inputTD2.setAttribute("type", "text");

        tableTD1.appendChild(inputTD1);
        tableTD2.appendChild(inputTD2);

        newElement.appendChild(tableTD1);
        newElement.appendChild(tableTD2);

        var more = document.getElementById("more");
        tableBody.insertBefore(newElement, more);

    });

    var id = getUrlParameter('id');
    type = getUrlParameter('type');
    name = getUrlParameter('name');
    $("#" + type + "-nav").addClass("selected");

    var currentInfo;

    var token = localStorage.getItem("token");
    console.log(token);

    $.ajax({
        url: "http://localhost:8083/api/user/42bad0ad-e7f2-4cfb-b9f5-66cfc2b6c5ad",
        type: 'GET',
        secure: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            currentInfo = data;
            console.log(data);

            document.getElementsByClassName("completeName")[0].value = data.fullName;

            var infos = data.information;
            infos.forEach(createInformation);
            openSuccess();
            setTimeout(function () {
                closeSuccess();
            }, 2000);
        },
        error: function (xhr, status, error) {
            openError(xhr);
        },
    });


    $("#updateValues").on("click", function () {
        var newInfo = {};

        newInfo.fullName = document.getElementsByClassName("completeName")[0].value.trim();
        newInfo.userName = currentInfo.userName;
        newInfo.id = currentInfo.id;
        newInfo.information = [];

        var empty = 0;
        for (var i = 0; i < td_id; i++) {
            var fieldVal = document.getElementsByClassName("field_1")[i].value.trim();
            var contentVal = document.getElementsByClassName("field_2")[i].value.trim();
            if (fieldVal === "" || contentVal === "") {
                empty++;
            } else {
                var auxInfo = {
                    title: fieldVal,
                    description: contentVal,
                    positionIndex: i - empty
                };
                newInfo.information.push(auxInfo);
            }
        }

        console.log(newInfo);

        var dataString = JSON.stringify(newInfo);

        $.ajax({
            url: "http://localhost:8083/api/user/42bad0ad-e7f2-4cfb-b9f5-66cfc2b6c5ad",
            type: 'PUT',
            data: dataString,
            secure: true,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-type": "application/json"
            },
            success: function (data) {
                openSuccess();
                setTimeout(function () {
                    closeSuccess();
                }, 1000);
                setTimeout(function () {
                    location.reload();
                }, 2700);
            },
            error: function (xhr, status, error) {
                openError(xhr);
            }
        });


    });


    //Criando elemento information
    function createInformation(item) {

        td_id++;

        var tableBody = document.getElementsByTagName("tbody")[0];
        var newElement = document.createElement("tr");
        newElement.setAttribute("id", td_id);

        var tableTD1 = document.createElement("td");
        var tableTD2 = document.createElement("td");

        var inputTD1 = document.createElement("input");
        inputTD1.setAttribute("class", "field_1");
        inputTD1.setAttribute("type", "text");
        inputTD1.setAttribute("value", item.title);

        var inputTD2 = document.createElement("input");
        inputTD2.setAttribute("class", "field_2");
        inputTD2.setAttribute("type", "text");
        inputTD2.setAttribute("value", item.description);

        tableTD1.appendChild(inputTD1);
        tableTD2.appendChild(inputTD2);

        newElement.appendChild(tableTD1);
        newElement.appendChild(tableTD2);

        var more = document.getElementById("more");
        tableBody.insertBefore(newElement, more);
    }

    //Request Response code

    $(".closeError").mousedown(function () {
        closeError();
    });
    $(".openCloseError").mousedown(function () {
        expandError();
    });

    function openSuccess() {
        $(".successMsg").css("left", "0px");
    }

    function closeSuccess() {
        $(".successMsg").css("left", "-350px");
    }

    function openError(errorData) {
        $(".errorMsg").css("left", "0px");
        $(".errorStatus").text("Error: " + errorData.status);
        $(".botError").text(JSON.stringify(errorData.responseJSON, null, 2));
    }

    var errorExpand = false;

    function expandError() {
        if (errorExpand) {
            $(".errorMsg").css("height", "75px");
            $(".openCloseError").css("transform", "rotateZ(0deg)")
            errorExpand = false;
        } else {
            $(".errorMsg").css("height", "280px");
            $(".openCloseError").css("transform", "rotateZ(180deg)")
            errorExpand = true;
        }
    }

    function closeError() {
        $(".errorMsg").css("height", "75px");
        $(".errorMsg").css("left", "-350px");
        $(".openCloseError").css("transform", "rotateZ(0deg)")
        errorExpand = false;
    }

    //End of Response Code
});

var getUrlParameter = function getUrlParameter(sParam) {
    let sPageURL = window.location.search.substring(1),
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
