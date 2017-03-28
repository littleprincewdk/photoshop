/**
 * Created by wudengke on 2017/2/12.
 * 移动和缩放
 */

define(function(require,exports,module){
    var vars=require("./photoshop.js"),
        defaults=vars.defaults,
        DestinationCanvas=vars.DestinationCanvas,
        image=vars.image;
    function transform(){
        DestinationCanvas.css("cursor","move")
          .on("mousedown.transform",function(e){
            DestinationCanvas.status.isMouseDown=true;
            var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
            DestinationCanvas.status.lastMouseCoordinateX=coordinateToCanvas.x;
            DestinationCanvas.status.lastMouseCoordinateY=coordinateToCanvas.y;
        }).on("mouseup.transform",function(){
            DestinationCanvas.status.isMouseDown=false;
        }).on("mouseout.transform",function(){
            DestinationCanvas.status.isMouseDown=false;
        }).on("mousemove.transform",function(e){
            //鼠标拖放
            if(DestinationCanvas.status.isMouseDown){
                var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
                var curImageCoordinateX=DestinationCanvas.status.curImageCoordinateX+coordinateToCanvas.x-DestinationCanvas.status.lastMouseCoordinateX,
                    curImageCoordinateY=DestinationCanvas.status.curImageCoordinateY+coordinateToCanvas.y-DestinationCanvas.status.lastMouseCoordinateY;
                DestinationCanvas.status.curImageCoordinateX=curImageCoordinateX;
                DestinationCanvas.status.curImageCoordinateY=curImageCoordinateY;
                DestinationCanvas.status.lastMouseCoordinateX=coordinateToCanvas.x;
                DestinationCanvas.status.lastMouseCoordinateY=coordinateToCanvas.y;
                //移动图片
                DestinationCanvas.drawImage();
            }
        }).on("mousewheel.transform",function(e){
            //滚轮缩放
            var scaleByX=-image.width*0.1*e.deltaY,
                scaleByY=-image.height*0.1*e.deltaY;
            DestinationCanvas.status.curImageWidth-=scaleByX;
            DestinationCanvas.status.curImageHeight-=scaleByY;
            if(DestinationCanvas.status.curImageWidth>=image.minWidth&&DestinationCanvas.status.curImageWidth<=image.maxWidth&&DestinationCanvas.status.curImageHeight>=image.minHeight&&DestinationCanvas.status.curImageHeight<=image.maxHeight){
                var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
                (coordinateToCanvas.x<DestinationCanvas.status.curImageCoordinateX)&&(coordinateToCanvas.x=DestinationCanvas.status.curImageCoordinateX);
                (coordinateToCanvas.y<DestinationCanvas.status.curImageCoordinateY)&&(coordinateToCanvas.y=DestinationCanvas.status.curImageCoordinateY);
                (coordinateToCanvas.x>DestinationCanvas.status.curImageCoordinateX+DestinationCanvas.status.curImageWidth)&&(coordinateToCanvas.x=DestinationCanvas.status.curImageCoordinateX+DestinationCanvas.status.curImageWidth);
                (coordinateToCanvas.y>DestinationCanvas.status.curImageCoordinateY+DestinationCanvas.status.curImageHeight)&&(coordinateToCanvas.y=DestinationCanvas.status.curImageCoordinateY+DestinationCanvas.status.curImageHeight);
                var curImageCoordinateX=DestinationCanvas.status.curImageCoordinateX+(coordinateToCanvas.x-DestinationCanvas.status.curImageCoordinateX)/DestinationCanvas.status.curImageWidth*scaleByX,
                    curImageCoordinateY=DestinationCanvas.status.curImageCoordinateY+(coordinateToCanvas.y-DestinationCanvas.status.curImageCoordinateY)/DestinationCanvas.status.curImageHeight*scaleByY;

                DestinationCanvas.status.curImageCoordinateX=curImageCoordinateX;
                DestinationCanvas.status.curImageCoordinateY=curImageCoordinateY;
                //更新图片
                DestinationCanvas.drawImage();
            }else{
                //复原！！！
                DestinationCanvas.status.curImageWidth+=scaleByX;
                DestinationCanvas.status.curImageHeight+=scaleByY;
            }
        });
    }
    module.exports=transform;
});