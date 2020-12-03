$(document).ready(function () {


    var d;
    var token = localStorage.getItem("token");
    $.ajax("http://localhost:8083/api/inspection/list-all", {
        type: 'GET',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': "application/json",
            'Authorization': "Bearer " + token
        },
        success: function (data) {
            console.log(data);
            var leng = data.content.length;
            for (var i = 0; i < leng; i++) {
                var item = data.content[i];
                var newRow = $("<tr id=" + item.id + ">");

                if (item.draft) {
                    var cols = "<td> <div class ='row'><div class=  'col-2'><span class='fa fa-check-circle fa-lg' style='color:darkgreen'></span></div></div></td>";
                    cols += "<td> <div class ='row'> <div class= 'text-center'>" + item.title + "</div></div></td>";
                    cols += "<td><a href='inspection_information.html?id=" + item.id + "&name=" + item.target.name + "'><span class='fa fa-edit fa-lg'></span></a></td>";
                    cols += "<td><a href='inspection_edit.html?id=" + item.id + "&name=" + item.target.name + "'><span class='fa fa-list-ul fa-lg'></span></a></td>";
                    cols += "<td><a href='#'><span class='fas fa-door-open fa-lg closeInspection' value=" + item.id + "></span></a></td>";
                    cols += "<td><a href='#'><span class='fas fa-minus-circle fa-lg removeItem' value=" + item.id + "></span></a></td>";
                    newRow.append(cols);
                    $("#myTable").prepend(newRow);
                } else {
                    var cols = "<td class='openInspection' value=" + item.id + "> <div class ='row'><div class=  'col-2'><span class='fa fa-times-circle fa-lg' style='color:red'></span></div></div></td>";
                    cols += "<td class='openInspection' value=" + item.id + "> <div class ='row'> <div class= ''>" + item.title + "</div></div></td>";
                    cols += "<td></td>";
                    cols += "<td></td>";
                    cols += "<td></td>";
                    cols += "<td><a href='#'><span class='fas fa-minus-circle fa-lg removeItem' value=" + item.id + "></span></a></td>";
                    newRow.append(cols);
                    $("#myTable").append(newRow);
                }

            }

            openSuccess();
            setTimeout(function () {
                closeSuccess();
            }, 2000);
        },
        error: function (xhr, status, error) {
            openError(xhr);
        }
    });

    //View Inspection
    $("tbody").on("click", ".openInspection", function () {
        var inspectId = $(this).attr("value");
        localStorage.setItem("inspecID", inspectId);
        window.location.replace("./inspection_view.html");
    });

    //Close Inspection
    $("tbody").on("click", ".closeInspection", function () {
        var inspectId = $(this).attr("value");

        $.ajax({
            url: "http://localhost:8083/api/inspection/" + inspectId + "/close",
            type: 'POST',
            secure: true,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-type": "application/json"
            },
            success: function (data) {
                openSuccess();
                setTimeout(function () {
                    closeSuccess();
                }, 2000);
                setTimeout(function () {
                    location.reload();
                }, 2700);
            },
            error: function (xhr, status, error) {
                openError(xhr);
            }
        });
    });


    //Delete Inspection
    $("tbody").on("click", ".removeItem", function () {
        var inspectId = $(this).attr("value");

        $.ajax({
            url: "http://localhost:8083/api/inspection/" + inspectId,
            type: 'DELETE',
            secure: true,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-type": "application/json"
            },
            success: function (data) {
                openSuccess();
                setTimeout(function () {
                    closeSuccess();
                }, 2000);
                setTimeout(function () {
                    location.reload();
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
