$(document).ready(function () {

    var token = localStorage.getItem("token");

    $.ajax({
        url: "http://localhost:8083/api/target/list-all",
        type: 'GET',
        secure: true,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            console.log(data.content);
            var targets = data.content;
            targets.forEach(createTarget);

            openSuccess();
            setTimeout(function () {
                closeSuccess();
            }, 2000);
        },
        error: function (xhr, status, error) {
            openError(xhr);
        }
    });

    function createTarget(item) {
        var selectElement = document.getElementsByClassName("selectInput")[0];

        var newOpt = document.createElement("option");
        newOpt.setAttribute("value", item.id);
        newOpt.innerHTML = item.name;

        selectElement.appendChild(newOpt);
    }

    $(".createInspection").mousedown(function () {
        var title = document.getElementsByClassName("titleInput")[0].value.trim();
        var desc = document.getElementsByClassName("descInput")[0].value.trim();
        if (title == "") {
            openError({
                status: "Empty",
                responseJSON: {
                    error: "Title is empty"
                }
            });
            return 0;
        }
        if (desc == "") {
            openError({
                status: "Empty",
                responseJSON: {
                    error: "Description is empty"
                }
            });
            return 0;
        }
        var targetSelected = $(".selectInput").val();
        console.log(title + " - " + targetSelected);

        var newInfo = {
            title: title,
            description: desc,
            draft: true,
            target: {
                id: targetSelected
            },
            user: {
                id: "42bad0ad-e7f2-4cfb-b9f5-66cfc2b6c5ad"
            }
        };

        var dataString = JSON.stringify(newInfo);

        $.ajax({
            url: "http://localhost:8083/api/inspection/",
            type: 'POST',
            secure: true,
            data: dataString,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                openSuccess();
                setTimeout(function () {
                    closeSuccess();
                }, 2000);
                setTimeout(function () {
                    location.replace("./inspection_.html");
                }, 2700);
            },
            error: function (xhr, status, error) {
                openError(xhr);
            }
        });

    });


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
