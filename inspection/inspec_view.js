$(document).ready(function () {


//Active true ou off
    $(document).on("click", "article", function (e) {

        //Para n mudar quando clicar no botao ou note
        if (e.target.nodeName === "TEXTAREA" || e.target.nodeName === "BUTTON")
            return;

        console.log(this.className);
        //console.log(this.className);
        if (this.className == "col-md-2 activate" || this.className == "col-md-4 activate" || this.className == "col-12 activate") {
            $("#" + this.id).removeClass("activate");
            changeActiveState($(this).attr("id"));
        } else {
            $("#" + this.id).addClass("activate");
            changeActiveState($(this).attr("id"));
        }
    });

    var currentInfo;


//Mudar o estado do Active
    function changeActiveState(elemId) {
        console.log(elemId);

        //Vendo pelos Information
        var found = false;
        for (var i = 0; i < currentInfo.information.length; i++) {
            if (elemId == currentInfo.information[i].id) {
                currentInfo.information[i].active = !currentInfo.information[i].active;
                found = true;
                break;
            }
        }

        //Vendo pelos Target
        if (!found)
            for (var i = 0; i < currentInfo.target.information.length; i++) {
                if (elemId == currentInfo.target.information[i].id) {
                    currentInfo.target.information[i].active = !currentInfo.target.information[i].active;
                    found = true;
                    break;
                }
            }

        //Vendo pelos User
        if (!found)
            for (var i = 0; i < currentInfo.user.information.length; i++) {
                if (elemId == currentInfo.user.information[i].id) {
                    currentInfo.user.information[i].active = !currentInfo.user.information[i].active;
                    found = true;
                    break;
                }
            }

        //Vendo pelos Topics
        if (!found)
            for (var i = 0; i < currentInfo.topics.length; i++) {
                if (elemId == currentInfo.topics[i].id) {
                    currentInfo.topics[i].printInReport = !currentInfo.topics[i].printInReport;
                    found = true;
                    break;
                }
            }

        //Vendo pelos Files
        if (!found)
            for (var i = 0; i < currentInfo.topics.length; i++) {
                for (var j = 0; j < currentInfo.topics[i].files.length; j++) {

                    if (elemId == currentInfo.topics[i].files[j].id) {
                        currentInfo.topics[i].files[j].active = !currentInfo.topics[i].files[j].active;
                        found = true;
                        break;
                    }
                }
            }
    }

//Clicar Em Gerar PDF
    $('.print').on('click', function () {
        $.ajax("http://localhost:8083/api/inspection/" + localStorage.getItem("inspecID") + "/print", {
            type: 'GET',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-type': "application/json",
                'Authorization': "Bearer " + token
            },
            success: function (data) {
                console.log(data);

                createPDF(data);
            }
        });
    });


//Adicionar as Images e só depois criar o PDF
    function createPDF(inspectContent) {
        var ajaxCallsTotal = 0;
        var currentAjaxCalls = 0;


        //Criando uma variavel para saber quantas images serão criadas
        for (var i = 0; i < inspectContent.rules.length; i++) {
            for (var j = 0; j < inspectContent.rules[i].items.length; j++) {
                if (inspectContent.rules[i].items[j].files) {
                    for (var k = 0; k < inspectContent.rules[i].items[j].files.length; k++)
                        if (inspectContent.rules[i].items[j].files[k].active) {
                            ajaxCallsTotal++;
                        }
                }
            }
        }

        //Carregando imagens
        for (var i = 0; i < inspectContent.rules.length; i++) {
            for (var j = 0; j < inspectContent.rules[i].items.length; j++) {
                if (inspectContent.rules[i].items[j].files) {
                    var k = 0;
                    var l = inspectContent.rules[i].items[j].files.length;
                    var content = inspectContent.rules[i].items[j].files;
                    loadImages(k, l, content, i, j);
                }
            }
        }


        function waitLoop() {
            setTimeout(function () {
                if (currentAjaxCalls < ajaxCallsTotal)
                    waitLoop();
                else {
                    actuallyCreatePDF(inspectContent);
                }
            }, 3000)
        }

        waitLoop();

        function loadImages(k, l, content, ruleIndex, itemIndex) {
            if (k < l) {
                if (content[k].active) {

                    var url = "http://localhost:8083/api/attachment/download/" + content[k].attachment.id;

                    $.ajax(url, {
                        type: 'GET',
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-type': "application/json",
                            'responseType': 'blob',
                            'Authorization': "Bearer " + token
                        },
                        beforeSend: function (xhr) {
                            xhr.overrideMimeType('text/plain; charset=x-user-defined');
                        },
                        success: function (result, textStatus, jqXHR) {

                        },
                        error: function (xhr, textStatus, errorThrown) {
                            alert("Error in getting document " + textStatus);
                        },
                        complete: function (data) {

                            var binary = "";
                            var responseText = data.responseText;
                            var responseTextLen = responseText.length;

                            for (i = 0; i < responseTextLen; i++) {
                                binary += String.fromCharCode(responseText.charCodeAt(i) & 255);
                            }
                            imgString = "data:image/png;base64," + btoa(binary);

                            inspectContent.rules[ruleIndex].items[itemIndex].files[k].imageData = imgString;

                            currentAjaxCalls++;

                            setTimeout(function () {
                                loadImages(k + 1, l, content, ruleIndex, itemIndex);
                            }, 1000);

                        }
                    });
                } else {
                    loadImages(k + 1, l, content, ruleIndex, itemIndex);
                }
            }
        }

    }

//Criar o PDF
    function actuallyCreatePDF(data) {
        var dd = {
            content: [],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                bigger: {
                    fontSize: 15,
                    italics: true
                }
            }
        };
        dd.content.push({
            text: []
        });

        //Information
        for (var i = 0; i < data.information.length; i++) {
            dd.content[0].text.push(
                {
                    text: data.information[i].title + ': ',
                    bold: true
                },
                data.information[i].description + '\n',
            );
        }
        dd.content[0].text.push({text: '\n\n\n\n'});

        //Target Title
        dd.content.push({
            text: [
                {
                    text: data.target.name + '\n\n',
                    fontSize: 13,
                    bold: true,
                    decoration: 'underline'
                }
            ]
        });

        //Target Information
        for (var i = 0; i < data.target.information.length; i++) {
            dd.content[1].text.push(
                {
                    text: data.target.information[i].title + ': ',
                    bold: true
                },
                data.target.information[i].description + '\n',
            );
        }
        dd.content[1].text.push({text: '\n\n\n\n'});

        //Topics
        for (var i = 0; i < data.rules.length; i++) {
            //Rule Table
            dd.content.push({
                table: {
                    widths: ['*'],
                    body: [
                        [{
                            text: data.rules[i].title,
                            fontSize: 13,
                            bold: true,
                            alignment: 'center'
                        }],
                        [{
                            text: data.rules[i].description,
                            alignment: 'center'
                        }]
                    ]
                }
            });

            //Itens
            for (var j = 0; j < data.rules[i].items.length; j++) {
                dd.content.push({
                    text: '\n' + data.rules[i].items[j].title + ' - ' + data.rules[i].items[j].description,
                    alignment: 'justify'
                });

                if (data.rules[i].items[j].files)
                    for (var k = 0; k < data.rules[i].items[j].files.length; k++) {
                        if (data.rules[i].items[j].files[k].active) {

                            dd.content.push({
                                image: data.rules[i].items[j].files[k].imageData,
                                width: 250,
                                alignment: 'center'
                            });

                            dd.content.push({
                                text: data.rules[i].items[j].files[k].note + '\n\n',
                                alignment: 'center'
                            });
                        }
                    }

            }
        }

        //User Title
        dd.content.push(user = {
            text: [
                {
                    text: '\n\n' + data.user.fullName + '\n\n',
                    fontSize: 13,
                    bold: true,
                    decoration: 'underline'
                }
            ]
        });

        //User Information
        for (var i = 0; i < data.user.information.length; i++) {
            dd.content[dd.content.length - 1].text.push(
                {
                    text: data.user.information[i].title + ': ',
                    bold: true
                },
                data.user.information[i].description + '\n',
            );
        }
        dd.content[dd.content.length - 1].text.push({text: '\n\n\n\n'});

        pdfMake.createPdf(dd).open()
    }

//FIM CRIAR PDF

//Atualiza o objeto ao digitar
    $('#info-text').on('input', function () {
        currentInfo.note = $("#info-text").val().trim();
    });

    $(document).on("input", ".topicNote", function () {
        currentInfo.topics[$(this).attr("position")].note = $(this).val().trim();
    });

//Botao para Atualizar toda a inspection
    $('.updateInspection').on('click', function () {
        console.log(currentInfo);
        var dataToSend = JSON.stringify(currentInfo);

        $.ajax({
            url: "http://localhost:8083/api/inspection/" + localStorage.getItem("inspecID") + "/complete",
            type: 'PUT',
            secure: true,
            data: dataToSend,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-type": "application/json"
            },
            success: function (data) {
                console.log(data);
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

    $(document).on("click", ".updateFileNote", function () {
        var fileID = $(this).parent().attr("id");

        var fileNote = $(this).siblings("textarea").val();
        var fileTopicId;
        var newFile;
        for (var i = 0; i < currentInfo.topics.length; i++) {
            for (var j = 0; j < currentInfo.topics[i].files.length; j++) {
                if (fileID == currentInfo.topics[i].files[j].id) {
                    fileTopicId = currentInfo.topics[i].id;
                    newFile = currentInfo.topics[i].files[j];
                    break;
                }
            }
        }

        newFile.note = fileNote;
        newFile.topic = {
            id: fileTopicId
        };
        console.log(newFile);

        $.ajax({
            url: "http://localhost:8083/api/file/" + fileID,
            type: 'PUT',
            secure: true,
            data: JSON.stringify(newFile),
            headers: {
                "Authorization": "Bearer " + token,
                'Content-Type': 'application/json'
            },
            success: function (data) {
                console.log(data);
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

//Abrir Modal de Imagens
    $(document).on("click", ".send", function () {
        id_topic = this.id;
        console.log(id_topic);
        console.log(save_topic);
        var i = 0;
        var l = save_topic.length;
        while (id_topic != save_topic[i].id) {
            i++;
        }
        files_save = save_topic[i].files;

        files_save.forEach(createImages);

        $(".upload").attr("id", id_topic);

    });


//Upload de Imagens
    $(document).on("click", ".upload", function (event) {
        var formData = new FormData();
        formData.append('file', $('input[type=file]')[0].files[0]);
        console.log(formData);

        $.ajax({
            url: "http://localhost:8083/api/attachment/upload",
            type: 'POST',
            secure: true,
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                console.log(data);
                link(data.id, $(".upload").attr("id"), $("#setNote").val());
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

    function link(att_id, topicId, nota) {

        console.log(att_id);
        console.log(topicId);

        var newInfo = {
            positionIndex: 0,
            active: true,
            note: nota,
            attachment: {
                id: att_id
            },
            topic: {
                id: topicId
            }
        };

        var dataString = JSON.stringify(newInfo);
        console.log(dataString);

        $.ajax({
            url: "http://localhost:8083/api/file/",
            type: 'POST',
            secure: true,
            data: dataString,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                console.log(data);
                openSuccess();
                setTimeout(function () {
                    closeSuccess();
                }, 2000);
            },
            error: function (xhr, status, error) {
                openError(xhr);
            }
        });


    }

    var token = localStorage.getItem("token");

    function createImages(item, index) {
        if (files_save == "") {

        } else {

            var url = "http://localhost:8083/api/attachment/download/" + item.attachment.id;

            $.ajax(url, {
                type: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-type': "application/json",
                    'responseType': 'blob',
                    'Authorization': "Bearer " + token
                }, beforeSend: function (xhr) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                },
                success: function (result, textStatus, jqXHR) {

                    if (result.length < 1) {
                        alert("The thumbnail doesn't exist");
                        $("#" + item.id + " #img-inspec").attr("src", "data:image/png;base64,");
                        return;
                    }

                    var binary = "";
                    var responseText = jqXHR.responseText;
                    var responseTextLen = responseText.length;

                    for (i = 0; i < responseTextLen; i++) {
                        binary += String.fromCharCode(responseText.charCodeAt(i) & 255);
                    }
                    $("#" + item.id + " #img-inspec").attr("src", "data:image/png;base64," + btoa(binary));
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert("Error in getting document " + textStatus);
                }


            });


            console.log(item);
            if (item.active) {
                var artic = ' <article id="' + item.id + '" class="col-12 activate" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><img id="img-inspec" /><br><h6 style="text-align: left;">Note:</h6><textarea position=' + index + ' class="note-image"></textarea><button class="btn btn-primary updateFileNote">Update Note</button></article>';
            } else {
                var artic = ' <article id="' + item.id + '" class="col-12" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><img id="img-inspec" /><br><h6 style="text-align: left;">Note:</h6><textarea position=' + index + ' class="note-image"></textarea><button class="btn btn-primary updateFileNote">Update Note</button></article>';
            }


            $("#image-modal div.content").append(artic);
            $("#" + item.id + " textarea").val(item.note);

        }
    }


    function createInfo(item) {
        var artic;
        if (item.active) {
            artic = ' <article id="' + item.id + '" class="col-md-2 activate" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><h5>' + item.title + '</h5></article>';
        } else {
            artic = ' <article id="' + item.id + '" class="col-md-2" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><h5>' + item.title + '</h5></article>';
        }


        $("#information div.innerProjet").append(artic);


    }

    function createTarget(item) {
        if (item.active) {
            var artic = ' <article id="' + item.id + '" class="col-md-2 activate" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><h5>' + item.title + '</h5></article>';
        } else {
            var artic = ' <article id="' + item.id + '" class="col-md-2" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><h5>' + item.title + '</h5></article>';
        }


        $("#target div.innerProjet").append(artic);


    }

    function createUser(item) {
        if (item.active) {
            var artic = ' <article id="' + item.id + '" class="col-md-2 activate" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><h5>' + item.title + '</h5> </article>';
        } else {
            var artic = ' <article id="' + item.id + '" class="col-md-2" data-toggle="tooltip" data-placement="top" title="' + item.description + '"><h5>' + item.title + '</h5></article>';
        }


        $("#user div.innerProjet").append(artic);


    }

    function createTopic(topic, index) {
        if (topic.note == undefined) topic.note = "";
        if (topic.printInReport) {
            var artic = ' <article id="' + topic.id + '" class="col-md-4 activate"><div class="col-md-12 invcol"><h5>' + topic.item.rule.title + '</h5><h6>' + topic.item.title + ' - ' + topic.item.description + '</h6></div><div class="col-md-12 invcol"><h6 style="text-align: left;">Note:</h6><textarea position=' + index + ' class="topicNote">' + topic.note + '</textarea><button id="' + topic.id + '" type="button" class="btn btn-primary send" data-toggle="modal" data-target="#exampleModal"> Images</button></div></article>';
        } else {
            var artic = ' <article id="' + topic.id + '" class="col-md-4 "><div class="col-md-12 invcol"><h5>' + topic.item.rule.title + '</h5><h6>' + topic.item.title + ' - ' + topic.item.description + ' </h6></div><div class="col-md-12 invcol"><h6 style="text-align: left;">Note:</h6><textarea position=' + index + ' class="topicNote">' + topic.note + '</textarea><button id="' + topic.id + '" type="button" class="btn btn-primary send" data-toggle="modal" data-target="#exampleModal"> Images</button></div></article>';
        }


        $("#topic div.innerProjet").append(artic);
        $("#topic div.innerProjet").addClass("forTopic")


    }


    $.ajax("http://localhost:8083/api/inspection/" + localStorage.getItem("inspecID") + "/complete", {
        type: 'GET',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': "application/json",
            'Authorization': "Bearer " + token
        },
        success: function (data) {
            currentInfo = data;
            console.log(data);
            $("#title").text(data.title);
            $("#description").text(data.description);
            data.information.forEach(createInfo);
            $("#info-text").text(data.note);
            data.target.information.forEach(createTarget);
            data.user.information.forEach(createUser);
            data.topics.forEach(createTopic);
            save_topic = data.topics;

        }


    });


    //Fechar Modal

    $(".close").on("click", function () { //função apagar modal dando mts erros
        const myNode = document.getElementById("#modal-img");
        myNode.textContent = '';
        modalIsOpen = false;
    });

    $('.modal').on('click', function (e) {
        if (e.target !== this)
            return;

        const myNode = document.getElementById("#modal-img");
        myNode.textContent = '';
    });

    //Fim Fechar Modal


});


var save_topic;
var id_topic;
var files_save;
var i;


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
