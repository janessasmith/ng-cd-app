//启动主程序
//作者:bai.zhiming
//时间:2016-9-18
//描述:图片剪裁
"use strict";
$(function() {
    var $mainDiv = $("#main");
    var $img = $("#img"),
        img, event;
    var isWidthOrHeight = window.parent.crop.picturesize === "" ? false : true;
    var widthHeight, cropWidth, cropHeight;
    if (isWidthOrHeight) {
        widthHeight = window.parent.crop.picturesize.split(",");
        cropWidth = widthHeight[0];
        cropHeight = widthHeight[1];
    }
    var aspectRatio = cropWidth / cropHeight,
        imgSrc;
    window.parent.crop.src.imgSrc = window.parent.crop.src.imgSrc.replace(/ScaleWidth=600&/g, "");
    imgSrc = window.parent.crop.src.imgSrc;
    if (window.parent.crop.src.imgSrc.indexOf("data") === 0) {
        imgSrc = window.parent.crop.src.imgSrc;
    } else if (window.parent.crop.src.imgSrc.indexOf("http://") === 0) {
        var imgArray = window.parent.crop.src.imgSrc.split("/");
        imgArray.splice(0, 3);
        imgSrc = ("/" + imgArray.join("/")).replace(/ScaleWidth=600&/g, "");
    }
    var imgType = getImageType(imgSrc);
    img = new Image();
    img.src = imgSrc;
    img.onload = function() {
        $img.attr("src", imgSrc);
        var options = {
            //aspectRatio: 16 / 9,
            checkCrossOrigin: false,
            zoomable: true,
            dragMode: 'none',
            /*minCropBoxWidth: cropWidth,
            minCropBoxHeight: cropHeight,
            aspectRatio: aspectRatio,
            autoCropArea: 0.1,
            cropBoxResizable: false,*/
            crop: function(e) {
                //console.log(e);
            }
        };
        if (isWidthOrHeight) {
            options.minCropBoxWidth = cropWidth;
            options.minCropBoxHeight = cropHeight;
            options.aspectRatio = aspectRatio;
            options.autoCropArea = 0.1;
            options.cropBoxResizable = false;
            //options.zoomable = false;
        }
        $img.on({
            'build.cropper': function(e) {
                //console.log(e.type);
            },
            'built.cropper': function(e) {
                //console.log(e.type);
            },
            'cropstart.cropper': function(e) {
                //console.log(e.type, e.action);
            },
            'cropmove.cropper': function(e) {
                //console.log(e.type, e.action);
            },
            'cropend.cropper': function(e) {
                //console.log(e.type, e.action);
            },
            'crop.cropper': function(e) {
                event = e;
            },
            'zoom.cropper': function(e) {
            }
        }).cropper(options);
    };
    //将DataUrl 转换成blob
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    }
    /**
     * [cutPicture description]根据图片地址判断图片类型
     * @param  {[string]} src [description] 图片路径
     * @return {[string]}  type [description] 返回图片类型
     */
    function getImageType(src) {
        var typeMap = {
            jpg: "jpeg",
            png: "png",
            bmp: "bmp",
            gif: "gif",
            jpeg: "jpeg",
        };
        var switchSrc = src.toLowerCase();
        var imgType = "jpeg";
        for (var j in typeMap) {
            if (switchSrc.indexOf(j) > 0) {
                imgType = typeMap[j];
                break;
            }
        }
        return imgType;
    }
    /**
     * [getFileName description]获取图片名称
     * @param  {[string]} imgSrc [description] 图片路径
     * @return {[string]}  type [description] 返回图片名称
     */
    function getFileName(imgSrc) {
        var fileName;
        var imgSrcArray;
        //var folderext = imgSrc.indexOf("read_image.jsp") > 0||imgSrc.indexOf("readimg?")>0 ? "U0" : "W0";
        var isInJsp = imgSrc.indexOf("read_image.jsp") > 0 || imgSrc.indexOf("readimg?") > 0 ? true : false;
        if (!isInJsp) {
            imgSrcArray = imgSrc.split("/");
            fileName = imgSrcArray[imgSrcArray.length - 1];
        } else {
            imgSrcArray = imgSrc.split("=");
            fileName = imgSrcArray[1];
        }
        return fileName;
    }
    window.parent.crop.watch("confirm", function(newV, oldV) {
        $.ajax({
            type: "get",
            url: "/wcm/mlfcenter.do",
            data: {
                serviceid: "mlf_image",
                methodname: "cropimage",
                FILENAME: getFileName(imgSrc),
                X: Math.round(event.x),
                Y: Math.round(event.y),
                WIDTH: Math.round(event.width),
                HEIGHT: Math.round(event.height)
            },
            success: function(data) {
                var params = {
                    imgName: data.FN,
                    imgSrc: "/wcm/file/read_image.jsp?FileName=" + data.FN,
                    success: "上传成功"
                };
                window.parent.crop.src = params;
                delete window.parent.crop;
            },
            dataType: "json",
            error: function(data) {}
        });
        /*var result = $img.cropper("getCroppedCanvas");
        var pic = result.toDataURL('image/' + imgType); //.replace(/^data:image\/(png|jpeg);base64,/, "");
        var blob = dataURLtoBlob(pic);
        var fd = new FormData();
        fd.append("image", blob, "image." + imgType);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/wcm/openapi/uploadImage', true);
        xhr.send(fd);
        xhr.onreadystatechange = function() {
            if (data !== "") {
                try {
                    var data = xhr.responseText;
                    window.parent.crop.src = JSON.parse(data);
                    delete window.parent.crop;
                } catch (e) {

                }
            }
        };*/
    });
});
