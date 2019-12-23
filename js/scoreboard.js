let host = "http://localhost:53494";

function loadScores() {
    $.get(host + "/get/3", function (data) {
        let p = $("#scoreboard dl");
        data.forEach(element => {
            p.append("<dt>"+ element.user + "</dt><dd>"+ element.score + "</dd>")
        });
    });
}

$(function () {
    loadScores();
});