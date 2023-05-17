const playing = [false, false, false, false];
const button = new Array(32);
for(var i = 0; i < 32; i++) {
    button[i] = false;
}
// function setBrightness(val) {
//     var xhr = new XMLHttpRequest();
//     xhr.open("GET", "/led?brightness=" + val, true);
//     xhr.send();
// }
// $(".progress")[0].addEventListener("mousedown", function(event) {
//     x = event.offsetX;
//     var w = $(this).width();
//     let brightness;
//     if(x >= w) {
//         $(this).children(".progress-bar").width("100%");
//         brightness = 255;
//     } else if( x <= 0){
//         $(this).children(".progress-bar").width("0%");
//         brightness
//         brightness = 0;
//     } else {
//         $(this).children(".progress-bar").width((x/w)*100 + "%");
//         brightness = Math.floor((x/w) * 255);
//     }
//     setBrightness(brightness);
// });
const drums = ["bass", "snare", "open", "close"];
drums.forEach(drum => {
    $("." + drum).on("click", function() {
        buttonAnimation(drum, this.id);
    });
});

for(var i = 0; i < 32; i++){
    document.querySelectorAll(".lines")[i].addEventListener("click", function() {
        var n = parseInt($(this).attr("id")) - 1;
        if(!button[n]) {
            $(this).addClass("lines-pressed");
            button[n] = true;
        } else {
            $(this).removeClass("lines-pressed");
            button[n] = false;
        }
    });
}

function buttonAnimation(currentKey, i) {
    var activeButton = $("." + currentKey.toLowerCase());
    if(!playing[i])
    {
        activeButton.addClass(currentKey.toLowerCase() + "-pressed");
        playing[i] = true;
    } else{
        activeButton.removeClass(currentKey.toLowerCase() + "-pressed");
        playing[i] = false;
    }
}