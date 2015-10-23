(function(Snap, window, undefined) {
"use strict";

var stage;


var $unselectall = document.getElementById('unselectall');



var options = {

    onselect:function() {
        console.log('selected!');
    },
    onunselect:function() {
        console.log('un-selected!');
    }

};


var elements = [];
var init = function()  {
    elements.push(stage.rect(10,10, 300, 400, 5, 5));
    elements.push(stage.circle(100,100, 100));

    for (var i=0; i<elements.length; i++) {
        elements[i].controllable(options);
    }
};

$unselectall.onclick = function() {

    for (var i=0; i<elements.length; i++) {
        var c = elements[i].data('containerObject');
        c.hideControls();
    }
}


window.onload = function()  {
    stage = new Snap("#demo");
    init();
};


})(Snap, window);
