// uitgekozen sport: Hockey, Volleyball, Basketball, Football, Handball of Korfball
var selSport = "";
// uitgekozen modus: move, our, their, ball, arrow, dasharrow
var selMode = "";

var scale = 1;

function windowResize() {
    // veld is 1000 x 650 pixels. Moet passen op het scherm!
    var scaleX = $(window).width() / 1000.0;
    var scaleY = ($(window).height() - 56) / 650.0;

    scale = Math.min(scaleX, scaleY);

    $("#field").css("transform", "scale(" + scale + ")");
    $("#court").css("background-size", (scale * 1000));
}

function selectCourt(btn) {
    // sport kiezen en veld tonen
    $("#linkHome").removeClass("disabled");
    $("#linkCourt").addClass("disabled");
    $("#linkSave").removeClass("disabled");

    if (btn) {
        selSport = $(btn).attr("data-sport");
        $("#court").attr("data-sport", selSport);
        clearScreen();
        fillDropDown();
    }

    // veld tonen
    $("#choose").fadeOut(function () {
        $("#court").show();
        windowResize();
    });
}

function backToSelection(btn) {
    // terug naar sport selectie
    $("#linkHome").addClass("disabled");
    $("#linkCourt").removeClass("disabled");
    $("#linkSave").addClass("disabled");
    $("#court").hide();
    $("#choose").fadeIn();
}

function selectMode(btn) {
    // modus kiezen
    selMode = $(btn).attr("data-mode");

    // maak die button "active"
    $(".objects button").removeClass("active");
    $(btn).addClass("active");
}

// Tekenen: fieldDown, fieldMove, fieldUp

// teken nieuwe pijl
var newArrow = null;

// object die wordt verplaatst
var selObject = null;
// oorspronkelijke positie van het object die wordt verplaatst
var selObjectStartPos = null;

// pijl die wordt verplaatst
var selArrow = null;
// oorspronkelijke positie van de pijl die wordt verplaatst
var selArrowStartPos = null;

// x,y coordinaten van mouseDown
var firstClick = [0, 0];

function fieldDown(evt) {
    var x = evt.clientX / scale;
    var y = (evt.clientY - 56) / scale;

    firstClick = [x, y];

    if (selMode == "move") {
        if (evt.srcElement) {
            if ($(evt.srcElement).hasClass("addedObject")) {
                selObject = $(evt.srcElement);
                selObjectStartPos = {
                    left: selObject.position().left / scale,
                    top: selObject.position().top / scale
                };
            }
            else if (evt.srcElement.tagName == "line") {
                selArrow = $(evt.srcElement);
                selArrowStartPos = {
                    x1: selArrow.attr("x1") - 0,
                    y1: selArrow.attr("y1") - 0,
                    x2: selArrow.attr("x2") - 0,
                    y2: selArrow.attr("y2") - 0
                };
            }
        }
    }
    else if (selMode == "remove") {
        if (evt.srcElement) {
            if ($(evt.srcElement).hasClass("addedObject")) {
                $(evt.srcElement).remove();
            }
            if (evt.srcElement.tagName == "line") {
                $(evt.srcElement).remove();
            }
        }
    }
    else if (selMode == "arrow") {
        newArrow = createArrow(x, y, x, y, false);
    }
    else if (selMode == "dasharrow") {
        newArrow = createArrow(x, y, x, y, true);
    }
    else {
        var objectSize = 50;
        if (selMode == "ball") {
            // er mag maar een ball: andere verwijderen
            $(".addedObject.ball").remove();
            // hockeybal is kleiner
            if (selSport == "Hockey") {
                objectSize = 10;
            }
        }

        // teken het object zodat het raakpunt in het midden is
        $('<div/>', {
            "class": 'addedObject ' + selMode
        }).css({ left: x - objectSize / 2, top: y - objectSize / 2 }).appendTo('#field');
    }
}

function fieldMove(evt) {
    var x = evt.clientX / scale;
    var y = (evt.clientY - 56) / scale;

    // delta's vanaf fieldDown
    var deltaX = x - firstClick[0];
    var deltaY = y - firstClick[1];

    if (newArrow) {
        newArrow.attr({
            "x2": x, "y2": y
        });
        evt.preventDefault();
        evt.stopPropagation();
    }
    else if (selObject) {
        selObject.css({
            left: selObjectStartPos.left + deltaX,
            top: selObjectStartPos.top + deltaY
        });
    }
    else if (selArrow) {
        selArrow.attr("x1", selArrowStartPos.x1 + deltaX);
        selArrow.attr("y1", selArrowStartPos.y1 + deltaY);
        selArrow.attr("x2", selArrowStartPos.x2 + deltaX);
        selArrow.attr("y2", selArrowStartPos.y2 + deltaY);
    }
}

function fieldUp(evt) {
    newArrow = null;
    selObject = null;
    selArrow = null;
}

function createArrow(x1, y1, x2, y2, dash) {
    // <line x1="50" y1="100" x2="220" y2="270" stroke="white" stroke-width="8" marker-end="url(#arrow)" />
    var arrow = $(document.createElementNS("http://www.w3.org/2000/svg", 'line'));

    arrow.attr({
        "x1": x1, "y1": y1, "x2": x2, "y2": y2,
        "stroke": "white",
        "stroke-width": "8",
        "marker-end": "url(#arrow)",
        "stroke-linecap": "round"
    }).appendTo('#fieldSVG');

    if (dash) {
        arrow.attr("stroke-dasharray", "15");
    }

    return arrow;
}

// alle "tactics" per sport
var tactics = { "Hockey": [], "Volleyball": [], "Basketball": [], "Football": [], "Handball": [], "Korfball": [] };

// laad opgeslagen tactics vanuit localStorage
var sTactics = localStorage.getItem('myTactics');
if (sTactics) {
    tactics = JSON.parse(sTactics);
}

function save() {
    // sla tactics op onder een naam
    var name = prompt("Type the name of your new tactics?");
    if (name) {
        var newTactics = screenToObject();
        newTactics.name = name;
        tactics[selSport].push(newTactics);
        fillDropDown();
        // opslaan naar localStorage
        localStorage.setItem('myTactics', JSON.stringify(tactics));
    }
}

function clean() {
    tactics[selSport] = [];
    // opslaan naar localStorage
    localStorage.setItem('myTactics', JSON.stringify(tactics));
    fillDropDown();
}

function clearScreen() {
    $(".addedObject").remove();
    $("line").remove();
}

function fillDropDown() {
    var dropdowns = $(".dropdown-item");
    for (var i = 2; i < dropdowns.length; i++) {
        dropdowns[i].remove();
    }
    for (var i = 0; i < tactics[selSport].length; i++) {
        var tactic = tactics[selSport][i];
        $('<a/>', {
            "class": "dropdown-item",
            "href": "#",
            "onclick": "objectToScreen(" + i + ");"
        }).text((i + 1) + ". " + tactic.name).appendTo('.dropdown-menu');
    }
}

function objectToScreen(i) {
    clearScreen();
    var tactic = tactics[selSport][i];

    for (var i = 0; i < tactic["objects"].length; i++) {
        var obj = tactic["objects"][i];
        $('<div/>', { "class": obj.class }).css({ left: obj.left, top: obj.top }).appendTo('#field');
    }
    for (var i = 0; i < tactic["arrows"].length; i++) {
        var arr = tactic["arrows"][i];
        createArrow(arr.x1, arr.y1, arr.x2, arr.y2, arr.dash);
    }
}

function screenToObject() {
    var tactic = { "objects": [], "arrows": [] };

    var objects = $(".addedObject");
    for (var i = 0; i < objects.length; i++) {
        tactic["objects"].push({
            "class": $(objects[i]).attr("class"),
            "top": $(objects[i]).position().top / scale,
            "left": $(objects[i]).position().left / scale
        });
    }

    var lines = $("line");
    for (var i = 0; i < lines.length; i++) {
        tactic["arrows"].push({
            "x1": $(lines[i]).attr("x1"),
            "y1": $(lines[i]).attr("y1"),
            "x2": $(lines[i]).attr("x2"),
            "y2": $(lines[i]).attr("y2"),
            "dash": ($(lines[i]).attr("stroke-dasharray") == "15")
        });
    }
    return tactic;
}

/*
 * voorbeeld JSON
var tactics = {
    "Hockey": [{
        name: "Service",
        objects: [{ left: 323, top: 23232, class: "addedObject their" }, { left: 323, top: 23232, class: "addedObject their" }, { left: 323, top: 23232, class: "addedObject their" }],
        arrows: [{ x1: 2323, y1: 2323, x2: 333, y2: 222, dash: true }]
    }],
    "Volleyball": [],
    "Football": []
};
*/


