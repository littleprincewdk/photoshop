/**
 * Created by wudengke on 2017/2/12.
 * 裁剪工具
 */
define(function(require,exports,module){
    var $=require("jquery");
    var vars=require("./photoshop.js"),
        defaults=vars.defaults,
        DestinationCanvas=vars.DestinationCanvas;
    var canvasD=document.getElementById("destination-canvas"),
        contextD=canvasD.getContext("2d"),
        canvasM=document.getElementById("middle-canvas");

    function cut(tool){
        $(".tool-cut>li[data-cut="+tool+"]").on("click",function(){
            $(this).addClass("selected").siblings().removeClass("selected").end().parent().hide();
            cut.cutStatus=$.extend(true,{},cut[tool].cutStatus);//!!!深拷贝
            DestinationCanvas
                .css("cursor","crosshair")
                .unbind(".transform")
                .unbind(".cut") //解绑!!!!!
                .on("mousedown.cut",cut[tool].mouseDown)
                .on("mouseup.cut",cut[tool].mouseUp)
                .on("mousemove.cut",cut[tool].mouseMove);
            if(cut[tool].dbClick){
                DestinationCanvas.on("dblclick",cut[tool].dbClick);
            }
            return false;//父元素上有click事件
        });
    }

    //矩形裁剪工具
    cut.rect={};
    cut.rect.cutStatus={
        isMouseDown:false,
        hasStarted:false,
        done:false,
        lastMouseCoordinateX:0,
        lastMouseCoordinateY:0,
        startX:0,
        startY:0,
        width:0,
        height:0
    };
    cut.rect.mouseDown=function(e){
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(DestinationCanvas.css("cursor")=="move"){//移动选区

        }else{
            if(!cut.cutStatus.hasStarted){//开始新选区
                cut.cutStatus=$.extend(true,{},cut.rect.cutStatus);
                cut.cutStatus.hasStarted=true;
                cut.cutStatus.startX=coordinateToCanvas.x;
                cut.cutStatus.startY=coordinateToCanvas.y;
            }
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
        cut.cutStatus.isMouseDown=true;
    };
    cut.rect.mouseUp=function(e){
        if(DestinationCanvas.css("cursor")!="move"){
            var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
            cut.rect.calcAttr(coordinateToCanvas);
        }
        cut.rect.fillCutArea(DestinationCanvas);

        cut.cutStatus.isMouseDown=false;
        cut.cutStatus.done=true;
        cut.cutStatus.hasStarted=false;
    };
    cut.rect.mouseMove=function (e) {
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(cut.cutStatus.isMouseDown){
            if(DestinationCanvas.css("cursor")=="move"){//移动选区
                cut.rect.moveBy(coordinateToCanvas);

                cut.rect.fillCutArea(DestinationCanvas);
            }else{//新建选区
                cut.rect.calcAttr(coordinateToCanvas);

                cut.rect.stroke(DestinationCanvas);
            }
        }else{
            if(cut.cutStatus.done){
                contextD.save();
                cut.rect.buildPath();
                if(contextD.isPointInPath(coordinateToCanvas.x,coordinateToCanvas.y)){
                    DestinationCanvas.css("cursor","move");
                }else{
                    DestinationCanvas.css("cursor","crosshair");
                }
                contextD.restore();
            }
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
    };
    cut.rect.moveBy=function(coordinateToCanvas){
        cut.cutStatus.startX=cut.cutStatus.startX+coordinateToCanvas.x-cut.cutStatus.lastMouseCoordinateX;
        cut.cutStatus.startY=cut.cutStatus.startY+coordinateToCanvas.y-cut.cutStatus.lastMouseCoordinateY;
    };
    cut.rect.calcAttr=function(coordinateToCanvas){
        cut.cutStatus.width=coordinateToCanvas.x-cut.cutStatus.startX;
        cut.cutStatus.height=coordinateToCanvas.y-cut.cutStatus.startY;
    };
    cut.rect.stroke=function(Canvas){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage();
        contextD.save();
        cut.rect.buildPath();
        contextD.lineWidth=1;
        contextD.strokeStyle=defaults.cutTools.cutAreaBorderColor;
        contextD.stroke();
        contextD.restore();
    };
    cut.rect.fillCutArea=function (Canvas){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage(canvasM,Canvas.status.curImageCoordinateX,Canvas.status.curImageCoordinateY,Canvas);
        contextD.save();
        contextD.globalAlpha=defaults.cutTools.cutAreaOpacity;
        cut.rect.buildPath();
        contextD.fillStyle=defaults.cutTools.cutAreaColor;
        contextD.fill();
        contextD.restore();
    };
    cut.rect.buildPath=function(){
        contextD.beginPath();
        contextD.rect(cut.cutStatus.startX,cut.cutStatus.startY,cut.cutStatus.width,cut.cutStatus.height);
    };

    //圆形裁剪工具
    cut.circle={};
    cut.circle.cutStatus={
        isMouseDown:false,
        hasStarted:false,
        done:false,
        lastMouseCoordinateX:0,
        lastMouseCoordinateY:0,
        startX:0,
        startY:0,
        cx:0,
        cy:0,
        radius:0
    };
    cut.circle.mouseDown=function(e){
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(DestinationCanvas.css("cursor")=="move"){//移动选区

        }else{
            if(!cut.cutStatus.hasStarted){//开始新选区
                cut.cutStatus=$.extend(true,{},cut.circle.cutStatus);
                cut.cutStatus.hasStarted=true;
                cut.cutStatus.startX=coordinateToCanvas.x;
                cut.cutStatus.startY=coordinateToCanvas.y;
            }
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
        cut.cutStatus.isMouseDown=true;
    };
    cut.circle.mouseUp=function(e){

        if(DestinationCanvas.css("cursor")!="move"){
            var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
            //圆形选区属性确定
            cut.circle.calcAttr(coordinateToCanvas);
        }
        cut.circle.fillCutArea(DestinationCanvas);

        cut.cutStatus.isMouseDown=false;
        cut.cutStatus.done=true;
        cut.cutStatus.hasStarted=false;
    };
    cut.circle.mouseMove=function (e) {
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(cut.cutStatus.isMouseDown){
            if(DestinationCanvas.css("cursor")=="move"){//移动选区
                cut.circle.moveBy(coordinateToCanvas);

                cut.circle.fillCutArea(DestinationCanvas);
            }else{//新建选区
                //圆形选区属性确定
                cut.circle.calcAttr(coordinateToCanvas);

                cut.circle.stroke(DestinationCanvas);
            }
        }else{
            if(cut.cutStatus.done){
                contextD.save();
                cut.circle.buildPath();
                if(contextD.isPointInPath(coordinateToCanvas.x,coordinateToCanvas.y)){
                    DestinationCanvas.css("cursor","move");
                }else{
                    DestinationCanvas.css("cursor","crosshair");
                }
                contextD.restore();
            }
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
    };
    cut.circle.moveBy=function(coordinateToCanvas){
        cut.cutStatus.cx=cut.cutStatus.cx+coordinateToCanvas.x-cut.cutStatus.lastMouseCoordinateX;
        cut.cutStatus.cy=cut.cutStatus.cy+coordinateToCanvas.y-cut.cutStatus.lastMouseCoordinateY;
    };
    cut.circle.calcAttr=function(coordinateToCanvas){
        var cx=cut.cutStatus.startX/2+coordinateToCanvas.x/2,
            cy=cut.cutStatus.startY/2+coordinateToCanvas.y/2,
            radius=Math.sqrt((coordinateToCanvas.x-cx)*(coordinateToCanvas.x-cx)+(coordinateToCanvas.y-cy)*(coordinateToCanvas.y-cy));
        cut.cutStatus.cx=cx;
        cut.cutStatus.cy=cy;
        cut.cutStatus.radius=radius;
    };
    cut.circle.stroke=function(Canvas){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage(canvasM,Canvas.status.curImageCoordinateX,Canvas.status.curImageCoordinateY,Canvas);
        contextD.save();
        cut.circle.buildPath();
        contextD.lineWidth=1;
        contextD.strokeStyle=defaults.cutTools.cutAreaBorderColor;
        contextD.stroke();
        contextD.restore();
    };
    cut.circle.fillCutArea=function (Canvas){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage(canvasM,Canvas.status.curImageCoordinateX,Canvas.status.curImageCoordinateY,Canvas);
        contextD.save();
        contextD.globalAlpha=defaults.cutTools.cutAreaOpacity;
        cut.circle.buildPath();
        contextD.fillStyle=defaults.cutTools.cutAreaColor;
        contextD.fill();
        contextD.restore();
    };
    cut.circle.buildPath=function(){
        contextD.beginPath();
        contextD.arc(cut.cutStatus.cx,cut.cutStatus.cy,cut.cutStatus.radius,0,Math.PI*2);
    };

    //多边形裁剪工具
    cut.polygon={};
    cut.polygon.cutStatus={
        isMouseDown:false,
        hasStarted:false,
        lastMouseCoordinateX:0,
        lastMouseCoordinateY:0,
        dirtyX:0,
        dirtyY:0,
        points:[],
        done:false
    };
    cut.polygon.mouseDown=function(e){
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(DestinationCanvas.css("cursor")=="move"){//移动选区

        }else{
            if(!cut.cutStatus.hasStarted){//开始新选区
                cut.cutStatus=$.extend(true,{},cut.polygon.cutStatus);
                cut.cutStatus.hasStarted=true;
            }
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
        cut.cutStatus.isMouseDown=true;
    };
    cut.polygon.mouseUp=function(e){
        cut.cutStatus.isMouseDown=false;
        if(DestinationCanvas.css("cursor")!="move"){//选区过程
            if(cut.cutStatus.hasStarted){
                var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
                //增加一个点
                cut.cutStatus.points.push([coordinateToCanvas.x,coordinateToCanvas.y]);
                //绘制边
                cut.polygon.stroke(DestinationCanvas);
            }
        }else{//移动选区
            cut.polygon.fillCutArea(DestinationCanvas);
        }
    };
    cut.polygon.dbClick=function(e){//选区完成
        e.preventDefault();
        cut.cutStatus.hasStarted=false;
        cut.cutStatus.done=true;
        cut.polygon.fillCutArea(DestinationCanvas);
    };
    cut.polygon.mouseMove=function (e) {
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(cut.cutStatus.isMouseDown){
            if(DestinationCanvas.css("cursor")=="move"){//移动选区
                cut.polygon.moveBy(coordinateToCanvas);

                cut.polygon.fillCutArea(DestinationCanvas);
            }
        }else{
            if(cut.cutStatus.done){
                contextD.save();
                contextD.beginPath();
                cut.polygon.buildPath();
                contextD.closePath();
                if(contextD.isPointInPath(coordinateToCanvas.x,coordinateToCanvas.y)){
                    DestinationCanvas.css("cursor","move");
                }else{
                    DestinationCanvas.css("cursor","crosshair");
                }
                contextD.restore();
            }
        }
        if(!cut.cutStatus.done&&cut.cutStatus.hasStarted){
            cut.cutStatus.points.dirtyX=coordinateToCanvas.x;
            cut.cutStatus.points.dirtyY=coordinateToCanvas.y;

            //绘制边
            cut.polygon.stroke(DestinationCanvas,true);
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
    };
    cut.polygon.moveBy=function(coordinateToCanvas){
        var moveByX=coordinateToCanvas.x-cut.cutStatus.lastMouseCoordinateX,
            moveByY=coordinateToCanvas.y-cut.cutStatus.lastMouseCoordinateY;

        var length=cut.cutStatus.points.length;
        for(var i=0;i<length;i++){
            cut.cutStatus.points[i][0]+=moveByX;
            cut.cutStatus.points[i][1]+=moveByY;
        }
    };
    cut.polygon.stroke=function(Canvas,dirty){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage(canvasM,Canvas.status.curImageCoordinateX,Canvas.status.curImageCoordinateY,Canvas);
        contextD.save();
        contextD.beginPath();
        cut.polygon.buildPath(dirty);
        contextD.strokeStyle=defaults.cutTools.cutAreaBorderColor;
        contextD.stroke();
        contextD.restore();
    };
    cut.polygon.fillCutArea=function (Canvas){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage(canvasM,Canvas.status.curImageCoordinateX,Canvas.status.curImageCoordinateY,Canvas);
        contextD.save();
        contextD.globalAlpha=defaults.cutTools.cutAreaOpacity;
        cut.polygon.buildPath();
        contextD.fillStyle=defaults.cutTools.cutAreaColor;
        contextD.fill();
        contextD.restore();
    };
    cut.polygon.buildPath=function(dirty){
        contextD.beginPath();
        var length=cut.cutStatus.points.length;
        for(var i=0;i<length;i++){
            i==length?contextD.moveTo(cut.cutStatus.points[i][0],cut.cutStatus.points[i][1]):
                contextD.lineTo(cut.cutStatus.points[i][0],cut.cutStatus.points[i][1]);
        }
        if(dirty){
            contextD.lineTo(cut.cutStatus.points.dirtyX,cut.cutStatus.points.dirtyY);
        }
    };

    //椭圆裁剪工具
    cut.ellipse={};
    cut.ellipse.cutStatus={
        isMouseDown:false,
        lastMouseCoordinateX:0,
        lastMouseCoordinateY:0,
        startX:0,
        startY:0,
        x:0,
        y:0,
        a:0,
        b:0,
        done:false
    };
    cut.ellipse.mouseDown=function(e){
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(DestinationCanvas.css("cursor")=="move"){//移动选区

        }else{
            if(!cut.cutStatus.hasStarted){//开始新选区
                cut.cutStatus=$.extend(true,{},cut.ellipse.cutStatus);
                cut.cutStatus.hasStarted=true;
                cut.cutStatus.startX=coordinateToCanvas.x;
                cut.cutStatus.startY=coordinateToCanvas.y;
            }
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
        cut.cutStatus.isMouseDown=true;
    };
    cut.ellipse.mouseUp=function(e){
        if(DestinationCanvas.css("cursor")!="move"){//选区过程
            var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
            cut.ellipse.calcAttr(coordinateToCanvas);
        }
        cut.ellipse.fillCutArea(DestinationCanvas);

        cut.cutStatus.isMouseDown=false;
        cut.cutStatus.done=true;
        cut.cutStatus.hasStarted=false;
    };
    cut.ellipse.mouseMove=function (e) {
        var coordinateToCanvas=DestinationCanvas.getCoordinate(e.clientX,e.clientY);
        if(cut.cutStatus.isMouseDown){
            if(DestinationCanvas.css("cursor")=="move"){//移动选区
                cut.ellipse.moveBy(coordinateToCanvas);

                cut.ellipse.fillCutArea(DestinationCanvas);
            }else{//新建选区
                //椭圆形选区属性确定
                cut.ellipse.calcAttr(coordinateToCanvas);

                cut.ellipse.stroke(DestinationCanvas);
            }
        }else{
            if(cut.cutStatus.done){
                contextD.save();
                cut.ellipse.buildPath();
                if(contextD.isPointInPath(coordinateToCanvas.x,coordinateToCanvas.y)){
                    DestinationCanvas.css("cursor","move");
                }else{
                    DestinationCanvas.css("cursor","crosshair");
                }
                contextD.restore();
            }
        }
        cut.cutStatus.lastMouseCoordinateX=coordinateToCanvas.x;
        cut.cutStatus.lastMouseCoordinateY=coordinateToCanvas.y;
    };
    cut.ellipse.moveBy=function(coordinateToCanvas){
        cut.cutStatus.x+=coordinateToCanvas.x-cut.cutStatus.lastMouseCoordinateX;
        cut.cutStatus.y+=coordinateToCanvas.y-cut.cutStatus.lastMouseCoordinateY;
    };
    cut.ellipse.calcAttr=function(coordinateToCanvas){
        cut.cutStatus.x=coordinateToCanvas.x/2+cut.cutStatus.startX/2;
        cut.cutStatus.y=coordinateToCanvas.y/2+cut.cutStatus.startY/2;
        cut.cutStatus.a=Math.abs(coordinateToCanvas.x/2-cut.cutStatus.startX/2);
        cut.cutStatus.b=Math.abs(coordinateToCanvas.y/2-cut.cutStatus.startY/2);
    };
    cut.ellipse.fillCutArea=function (Canvas){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage(canvasM,Canvas.status.curImageCoordinateX,Canvas.status.curImageCoordinateY,Canvas);
        contextD.save();
        contextD.globalAlpha=defaults.cutTools.cutAreaOpacity;
        cut.ellipse.buildPath();
        contextD.fillStyle=defaults.cutTools.cutAreaColor;
        contextD.fill();
        contextD.restore();
    };
    cut.ellipse.stroke=function(Canvas){
        contextD.clearRect(0,0,defaults.canvasWidth,defaults.canvasHeight);
        DestinationCanvas.drawBackground();
        DestinationCanvas.drawImage(canvasM,Canvas.status.curImageCoordinateX,Canvas.status.curImageCoordinateY,Canvas);
        contextD.save();
        cut.ellipse.buildPath();
        contextD.lineWidth=1;
        contextD.strokeStyle=defaults.cutTools.cutAreaBorderColor;
        contextD.stroke();
        contextD.restore();
    };
    cut.ellipse.buildPath=function(){
        var r=cut.cutStatus.a>cut.cutStatus.b?cut.cutStatus.a:cut.cutStatus.b;
        var ratioX=cut.cutStatus.a/r,
            ratioY=cut.cutStatus.b/r;
        contextD.scale(ratioX,ratioY);
        contextD.beginPath();
        contextD.arc(cut.cutStatus.x/ratioX,cut.cutStatus.y/ratioY,r,0,Math.PI*2);


    };

    cut("rect");
    cut("circle");
    cut("polygon");
    cut("ellipse");
});