/**
 * Created by wudengke on 2017/2/12.
 * 处理事件
 */
define(function(require){
    var $=require("jquery");
    var vars=require("photoshop.js"),
        defaults=vars.defaults,
        DestinationCanvas=vars.DestinationCanvas,
        image=vars.image;
    var canvasD=document.getElementById("destination-canvas"),
        contextD=canvasD.getContext("2d"),
        canvasM=document.getElementById("middle-canvas"),
        contextM=canvasM.getContext("2d");
    image.onload=function(){
        contextM.save();

        contextM.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        contextM.drawImage(image,0,0,image.width,image.height);

        contextM.restore();

        DestinationCanvas.drawImage($.filter.effect=="rotate");
    };
    var transform=require("transform.js");
    transform();
    $(".menu-list-item").click(function(){
        $(this).find(".submenu-list").show()
            .end().addClass("selected")
            .siblings().removeClass("selected")
            .find(".submenu-list").hide();
    });
    $(".tool-list-item").click(function(){
        $(this).find(".subtool-list").show()
            .end().addClass("selected")
            .siblings().removeClass("selected");
    });
    $(".tool-move").click(function(){
        DestinationCanvas
        .unbind(".cut") //解绑!!!!!
        transform();
    });
});