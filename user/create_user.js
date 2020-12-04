$(document).ready(function () {

    $(".createUser").mousedown(function () {
        var userName = document.getElementsByClassName("userNameInput")[0].value.trim();
        var fullName = document.getElementsByClassName("fullNameInput")[0].value.trim();
        var pass = document.getElementsByClassName("passwordInput")[0].value.trim();
        if (userName == "") {
            openError({
                status: "Empty",
                responseJSON: {
                    error: "Username is empty"
                }
            });
            return 0;
        }
        if (fullName == "") {
            openError({
                status: "Empty",
                responseJSON: {
                    error: "Full Name is empty"
                }
            });
            return 0;
        }
        if (pass === "") {
            openError({
                status: "Empty",
                responseJSON: {
                    error: "Password is empty"
                }
            });
            return 0;
        }

        var newInfo = {
            userName: userName,
            fullName: fullName,
            password: pass,
        };

        var dataString = JSON.stringify(newInfo);
        $("#load-login").css("display", "inline-block");

        $.ajax({
            url: "http://localhost:8083/api/user/",
            type: 'POST',
            secure: true,
            data: dataString,
            headers: {
                "Content-Type": "application/json"
            },
            success: function (data) {
                $("#load-login").css("display", "none");
                openSuccess();
                setTimeout(function () {
                    closeSuccess();
                }, 2000);
                setTimeout(function () {
                    location.replace("../index.html");
                }, 2700);
            },
            error: function (xhr, status, error) {
                $("#load-login").css("display", "none");
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
