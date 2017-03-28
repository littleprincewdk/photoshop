/**
 * Created by wudengke on 2017/2/1.
 */
define(function(require, exports, module){
    var $=require("jquery");
    require("mouseWheel");

    var defaults={
        canvasBackgroundColor:"#282828",
        maxScale:5.0,
        minScale:0.1,
        //滤镜
        opacity:{
            opacity:{min:0,max:1.00,step:0.01,default:1.00,percentage:true}
        },
        grey:{
            grey:{min:0,max:3.0,step:0.1,default:1.0,percentage:true}
        },
        blackWhite:{
            threshold:{min:0,max:255,step:1,default:125}
        },
        blur:{
            distance:{min:4,max:16,step:1,default:8}
        },
        mosaic:{
            size:{min:5,max:20,step:1,default:10},
            distance:{min:1,max:6,step:1,default:3},
            x:{min:0,max:0,step:1,default:0},
            y:{min:0,max:0,step:1,default:0}
        },
        bright:{
            brightness:{min:0,max:3.00,step:0.01,default:2.00,percentage:true}
        },
        saturation:{
            saturation:{min:0,max:3.0,step:0.1,default:1.0,percentage:true}
        },
        rotate:{
            angle:{min:0,max:360,step:1,default:0}
        },
        //裁剪工具
        cutTools:{
            cutAreaColor:"#fff",
            cutAreaBorderColor:"#fff",
            cutAreaOpacity:0.3
        }
    };
    var WorkSpace=$("#workspace"),
        CANVAS_WIDTH=WorkSpace.width(),
        CANVAS_HEIGHT=WorkSpace.height();
    var canvasD=document.getElementById("destination-canvas"),
        contextD=canvasD.getContext("2d"),
        canvasM=document.getElementById("middle-canvas"),
        contextM=canvasM.getContext("2d");
    canvasD.width=CANVAS_WIDTH;
    canvasD.height=CANVAS_HEIGHT;

    var DestinationCanvas=$("#destination-canvas");

    DestinationCanvas.status={
        isMouseDown:false,
        lastMouseCoordinateX:0,
        lastMouseCoordinateY:0,
        curImageCoordinateX:0,
        curImageCoordinateY:0,
        curImageWidth:0,
        curImageHeight:0
    };
    var image=new Image();

    image.src="images/jana.jpg";
    $.extend(image,{
        maxWidth:image.width*defaults.maxScale,
        maxHeight:image.height*defaults.maxScale,
        minWidth:image.width*defaults.minScale,
        minHeight:image.height*defaults.minScale
    });

    canvasM.width=image.width;
    canvasM.height=image.height;

    defaults.mosaic.x.max=image.width;
    defaults.mosaic.y.max=image.height;

    DestinationCanvas.status.curImageWidth=image.width;
    DestinationCanvas.status.curImageHeight=image.height;

    image.onload=function(){
        contextM.save();

        contextM.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        contextM.drawImage(image,0,0,image.width,image.height);

        contextM.restore();
        DestinationCanvas.drawImage($.filter.effect=="rotate");
    };
    DestinationCanvas.extend({
        getCoordinate:function(x,y){
            var canvasCoordinate=DestinationCanvas.offset(),
                coordinateX=x-canvasCoordinate.left,
                coordinateY=y-canvasCoordinate.top;
            return {
                x:coordinateX,
                y:coordinateY
            }
        },
        drawBackground:function(){
            contextD.save();
            contextD.rect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
            contextD.fillStyle=defaults.canvasBackgroundColor;
            contextD.fill();
            contextD.restore();
        },
        //根据当前图片状态绘图
        drawImage:function(){
            contextD.save();

            contextD.clearRect(0,0,canvasD.width,canvasD.height);
            contextD.drawImage(canvasM,DestinationCanvas.status.curImageCoordinateX,DestinationCanvas.status.curImageCoordinateY,DestinationCanvas.status.curImageWidth,DestinationCanvas.status.curImageHeight);

            contextD.restore();
        }
    });
    exports.defaults=defaults;
    exports.DestinationCanvas=DestinationCanvas;
    exports.image=image;

});