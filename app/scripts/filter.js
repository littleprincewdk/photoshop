/**
 * Created by wudengke on 2017/2/12.
 * 滤镜
 */
define(function(require, exports, module){
    var $=require("jquery");
    var vars=require("./photoshop.js"),
        defaults=vars.defaults,
        DestinationCanvas=vars.DestinationCanvas,
        image=vars.image;

    var canvasD=document.getElementById("destination-canvas"),
        contextD=canvasD.getContext("2d"),
        canvasM=document.getElementById("middle-canvas"),
        contextM=canvasM.getContext("2d");

    $(".menu-filter>li").click(function(){
        $(".menu-filter").hide();

        var $Shade=$(".shade").show();
        filter($(this).attr("data-effect"));
        $Shade.hide();
    });
    //滤镜，实现各种效果
    function filter(effect){
        filter.effect=effect;

        contextM.clearRect(0,0,contextM.width,contextM.height);
        contextM.drawImage(image,0,0,image.width,image.height);
        switch (effect){
            case "opacity":
            case "grey":
            case "blackWhite":
            case "blur":
            case "mosaic":
            case "bright":
            case "saturation":
            case "rotate":
                for(var slider in defaults[effect]){
                    filter.initSlider(slider,defaults[effect][slider].percentage);
                }
                filter[effect]();
                break;
            default:
                $(".controller-slider>li").hide();
                filter[effect]();
        }
        filter.drawImage();
    };
    //调整效果参数后更新DestinationCanvas
    filter.update=function(){
        contextM.clearRect(0,0,contextM.width,contextM.height);
        contextM.drawImage(image,0,0,image.width,image.height);

        filter[filter.effect]();

        filter.drawImage(filter.effect=="rotate");
    };
    filter.initSlider=function(slider,isPercentage){
        var Slider=$("#"+this.effect+"-"+slider);
        Slider.parent().show().siblings().hide();
        $("input[id^="+this.effect+"]").parent().show();//???
        var min=defaults[this.effect][slider].min,
            max=defaults[this.effect][slider].max,
            cur=defaults[this.effect][slider].default;
        if(isPercentage){
            min=min*100+"%";
            max=max*100+"%";
        }
        Slider.on("change.slider",function(){
            filter.settings[filter.effect][slider]=this.value;
            filter.update(filter.effect);
            filter.updateSlider($(this),isPercentage)
        }).prop({
            min:defaults[this.effect][slider].min,
            max:defaults[this.effect][slider].max,
            step:defaults[this.effect][slider].step,
            value:defaults[this.effect][slider].default
        }).parent()
            .append("<span class='min'>"+min+"</span>")
            .append("<span class='max'>"+max+"</span>")
            .append("<span class='cur'>"+cur+"</span>");
        filter.updateSlider(Slider,isPercentage);
    };
    filter.updateSlider=function(Slider,isPercentage){
        var curValue=Slider.val();
        if(isPercentage){
            curValue=curValue*100+"%";
        }
        Slider.siblings(".cur").text(curValue);
    };
    //前缀是当前滤镜
    filter.settings={
        opacity:{
            opacity:defaults.opacity.opacity.default
        },
        grey:{
            grey:defaults.grey.grey.default
        },
        blackWhite:{
            threshold:defaults.blackWhite.threshold.default
        },
        blur:{
            distance:defaults.blur.distance.default
        },
        mosaic:{
            size:defaults.mosaic.size.default,
            distance:defaults.mosaic.distance.default,
            x:defaults.mosaic.x.default,
            y:defaults.mosaic.y.default,
            width:image.width,
            height:image.height
        },
        bright:{
            brightness:defaults.bright.brightness.default
        },
        saturation:{
            saturation:defaults.saturation.saturation.default
        },
        rotate:{
            angle:defaults.rotate.angle.default
        }
    };
    filter.drawImage=function(rotate){
        if(rotate){
            var angle=this.settings.rotate.angle/180*Math.PI;
            contextD.save();

            contextD.clearRect(0,0,canvasD.width,canvasD.height);
            contextD.translate(DestinationCanvas.status.curImageWidth/2,DestinationCanvas.status.curImageHeight/2);
            contextD.rotate(angle);
            contextD.drawImage(canvasM,DestinationCanvas.status.curImageCoordinateX-DestinationCanvas.status.curImageWidth/2,
                DestinationCanvas.status.curImageCoordinateY-DestinationCanvas.status.curImageHeight/2,DestinationCanvas.status.curImageWidth,DestinationCanvas.status.curImageHeight);

            contextD.restore();
        }else{
            contextD.save();

            contextD.clearRect(0,0,canvasD.width,canvasD.height);
            contextD.drawImage(canvasM,DestinationCanvas.status.curImageCoordinateX,DestinationCanvas.status.curImageCoordinateY,DestinationCanvas.status.curImageWidth,DestinationCanvas.status.curImageHeight);

            contextD.restore();
        }
    };
    /*
     * 各种滤镜
     */
    filter.opacity=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        for(var i=0;i<image.width*image.height;i++){
            pixelData[4*i+3]=255*this.settings.opacity.opacity;
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //灰度滤镜
    filter.grey=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        var grey=this.settings.grey.grey;
        for(var i=0;i<image.width*image.height;i++){
            var r=pixelData[4*i],
                g=pixelData[4*i+1],
                b=pixelData[4*i+2],
                a=pixelData[4*i+3];
            var value=(r*0.3+g*0.59+b*0.11)*grey;
            pixelData[4*i]=value;
            pixelData[4*i+1]=value;
            pixelData[4*i+2]=value;
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //黑白滤镜
    filter.blackWhite=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        var threshold=this.settings.blackWhite.threshold;
        for(var i=0;i<image.width*image.height;i++){
            var r=pixelData[4*i],
                g=pixelData[4*i+1],
                b=pixelData[4*i+2],
                a=pixelData[4*i+3];
            var grey=r*0.3+g*0.59+b*0.11,
                v=0;
            grey>threshold?v=255:v=0;
            pixelData[4*i]=v;
            pixelData[4*i+1]=v;
            pixelData[4*i+2]=v;
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //反色滤镜
    filter.reverse=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        for(var i=0;i<image.width*image.height;i++){
            var r=pixelData[4*i],
                g=pixelData[4*i+1],
                b=pixelData[4*i+2],
                a=pixelData[4*i+3];
            pixelData[4*i]=255-r;
            pixelData[4*i+1]=255-g;
            pixelData[4*i+2]=255-b;
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //模糊滤镜
    filter.blur=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        var blurDistance=this.settings.blur.distance;
        for(var i=0;i<image.height;i++){
            for(var j=0;j<image.width;j++){
                var totalR=0,totalG=0,totalB=0,totalNum=0;
                for(var dr=-blurDistance;dr<=blurDistance;dr++){
                    for(var dc=-blurDistance;dc<=blurDistance;dc++){
                        var row=i+dr,
                            col=j+dc;
                        if(0<=row&&row<image.height&&0<=col&&col<image.width){
                            totalNum+=1;
                            var dp=row*image.width+col;
                            totalR+=pixelData[4*dp];
                            totalG+=pixelData[4*dp+1];
                            totalB+=pixelData[4*dp+2];
                        }
                    }
                }
                var p=i*image.width+j;
                pixelData[4*p]  =totalR/totalNum;
                pixelData[4*p+1]=totalG/totalNum;
                pixelData[4*p+2]=totalB/totalNum;
            }
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //镜像滤镜
    filter.mirror=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        for(var i=0;i<image.height;i++){
            for(var j=0;j<image.width/2;j++){
                var p=i*image.width+j;
                var mirrorP=i*image.width+image.width-j;
                var tamp=0;
                tamp=pixelData[4*p];
                pixelData[4*p]=pixelData[4*mirrorP];
                pixelData[4*mirrorP]=tamp;
                tamp=pixelData[4*p+1];
                pixelData[4*p+1]=pixelData[4*mirrorP+1];
                pixelData[4*mirrorP+1]=tamp;
                tamp=pixelData[4*p+2];
                pixelData[4*p+2]=pixelData[4*mirrorP+2];
                pixelData[4*mirrorP+2]=tamp;
            }
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    filter.mirror2=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        for(var i=0;i<image.height;i++){
            for(var j=0;j<image.width;j++){
                var p=i*image.width+j;
                var mirrorP=i*image.width+image.width-j;
                pixelData[4*p]=pixelData[4*mirrorP];
                pixelData[4*p+1]=pixelData[4*mirrorP+1];
                pixelData[4*p+2]=pixelData[4*mirrorP+2];
            }
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };

    filter.mirror3=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        for(var i=0;i<image.height;i++){
            for(var j=0;j<image.width;j++){
                var p=i*image.width+j;
                if(j>image.width/2){
                    var mirrorP=i*image.width+image.width-j;
                    pixelData[4*p]=pixelData[4*mirrorP];
                    pixelData[4*p+1]=pixelData[4*mirrorP+1];
                    pixelData[4*p+2]=pixelData[4*mirrorP+2];
                }
            }
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //马赛克滤镜
    filter.mosaic=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        var size=this.settings.mosaic.size,
            distance=this.settings.mosaic.distance,
            dx=this.settings.mosaic.x,
            dy=this.settings.mosaic.y,
            dw=this.settings.mosaic.width,
            dh=this.settings.mosaic.height;
        for(var i=dy-1;i<dy+dh-1;i+=size){
            for(var j=dx-1;j<dx+dw-1;j+=size){
                var totalR=0,totalG=0,totalB=0,totalNum=0;
                for(var dr1=-distance;dr1<distance+size;dr1++){
                    for(var dc1=-distance;dc1<distance+size;dc1++){
                        var row1=i+dr1,
                            col1=j+dc1;
                        if(dy-1<=row1&&row1<dy+dh-1&&dx-1<=col1&&col1<dx+dw-1){
                            totalNum+=1;
                            var dp=row1*image.width+col1;
                            totalR+=pixelData[4*dp];
                            totalG+=pixelData[4*dp+1];
                            totalB+=pixelData[4*dp+2];
                        }
                    }
                }
                for(var dr2=0;dr2<=size;dr2++){
                    for(var dc2=0;dc2<=size;dc2++){
                        var row2=i+dr2,
                            col2=j+dc2;
                        if(dy-1<=row2&&row2<dy+dh-1&&dx-1<=col2&&col2<dx+dw-1){
                            var p=row2*image.width+col2;
                            pixelData[4*p]=totalR/totalNum;
                            pixelData[4*p+1]=totalG/totalNum;
                            pixelData[4*p+2]=totalB/totalNum;
                        }
                    }
                }
            }
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //亮度滤镜
    filter.bright=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        var brightness=this.settings.bright.brightness;
        for(var i=0;i<image.height;i++){
            for(var j=0;j<image.width;j++){
                var p=i*image.width+j;
                var r=pixelData[4*p],
                    g=pixelData[4*p+1],
                    b=pixelData[4*p+2],
                    a=pixelData[4*p+3];
                pixelData[4*p]=r*brightness;
                pixelData[4*p+1]=g*brightness;
                pixelData[4*p+2]=b*brightness;
            }
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //饱和度滤镜
    filter.saturation=function(){
        var imageData=contextM.getImageData(0,0,image.width,image.height);
        var pixelData=imageData.data;
        var saturation=this.settings.saturation.saturation;
        for(var i=0;i<image.height;i++){
            for(var j=0;j<image.width;j++){
                var p=i*image.width+j;
                var r=pixelData[4*p],
                    g=pixelData[4*p+1],
                    b=pixelData[4*p+2],
                    average=1/3*(r+g+b);
                pixelData[4*p]=r+(saturation-1)*(r-average);
                pixelData[4*p+1]=g+(saturation-1)*(g-average);
                pixelData[4*p+2]=b+(saturation-1)*(b-average);
            }
        }
        contextM.putImageData(imageData,0,0,0,0,image.width,image.height);
    };
    //旋转
    filter.rotate=function(){
        contextM.clearRect(0,0,image.width,image.height);
        contextM.save();
        contextM.drawImage(image,0,0,image.width,image.height);
        contextM.restore();
    };
})