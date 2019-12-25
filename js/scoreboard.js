let host = "http://localhost:53494";

function loadScores() {
    $.get(host + "/get/3", function (data) {
        let p = $("#scoreboard div dl");
        data.forEach(element => {
            p.append("<dt>" + element.user + "</dt><dd>" + element.score + "</dd>")
        });
    })
    .fail(function () {
        $("#scoreboard div").html("<p class='error'>Connection error. Is the API running?</p><button id='btnReload'>Reload</button>");
    });
}

$(function () {
    let user = Cookies.get('user');
    if(user !== undefined){
        $("#txtUser").val(user);
        $("#user h3 span").html(user);
    }

    loadScores();

    $("#scoreboard div").on("click", "#btnReload", function(){
        $("#scoreboard div").html("");
        loadScores();
    })

    $("#btnLogin").on("click", function() {
        let user = $("#txtUser").val();
        Cookies.set('user', user);
        $("#user h3 span").html(user);
    })
});

