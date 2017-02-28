//创建人：bai.zhiming
//创建时间：2016-9-23
//描述：编辑图片服务
"use strict";
angular.module("editPictureServiceModule", ["editPictureModule", "trsCutPictureCtrlMoudle", "newCropperModule","newCropperPreviewModule"])
    .factory("editPictureService", ["$modal", "$q", "trsHttpService", function($modal, $q, trsHttpService) {
        var loadWatermark;

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

        function getFileName(imgSrc) {
            var fileName;
            var imgSrcArray;
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
        /**
         * [submitDatabase64Url description]提交database64图片数据
         * @return {[string]}  图片地址 [description] 图片返回信息
         */
        function submitDatabase64Url(databaseUrl) {
            var imgType = getImageType(databaseUrl);
            var deffer = $q.defer();
            var blob = dataURLtoBlob(databaseUrl);
            var fd = new FormData();
            fd.append("image", blob, "image." + imgType);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/wcm/openapi/uploadImage', true);
            xhr.send(fd);
            var data;
            xhr.onreadystatechange = function() {
                try {
                    data = xhr.responseText;
                    if (data !== "" && data !== undefined) {
                        return deffer.resolve(JSON.parse(data));
                    }
                } catch (e) {

                }
            };
            return deffer.promise;
        }
        /**
         * [getFolderext description]获取目录类型
         * @param  {[string]} fileName [description] 图片名称
         * @return {[string]}  folderext [description] 返回目录类型
         */
        function getFolderext(fileName) {
            return fileName.indexOf("U0") === 0 ? "U0" : "W0";
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
                if (switchSrc.indexOf("." + j) > 0 || switchSrc.indexOf("image/" + j) > 0) {
                    imgType = typeMap[j];
                    break;
                }
            }
            return imgType;
        }
        return {
            /**
             * [cutPicture description]图片裁剪
             * @param  {[string]} src [description] 图片路径
             * @param  {[string]} picturesize [description] 图片剪裁框大小
             * @return {[FN]}  success [description] 回调函数 返回处理好的图片路径
             */
            cutPicture: function(src, picturesize, success, cancel) {
                var modalInstance = $modal.open({
                    templateUrl: "./components/service/editPicture/trsCutPicture/template/trsCutPicture_tpl.html",
                    windowClass: 'cutOut',
                    backdrop: false,
                    controller: "cutPictureCtrl",
                    resolve: {
                        params: function() {
                            var params = {
                                src: src,
                                picturesize: picturesize
                            };
                            return params;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    if (result && angular.isFunction(success)) {
                        success(result);
                    } else if (!result && angular.isFunction(cancel)) {
                        cancel();
                    }
                });
            },
            /**
             * [editPicture description]编辑图片
             * @param  {[string]} src [description] 图片路径
             * @param  {[string]} picturesize [description] 图片剪裁框大小
             * @return {[FN]}  success [description] 回调函数 返回处理好的图片路径
             */
            editPicture: function(image, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./components/service/editPicture/editPicture_tpl.html",
                    windowClass: 'editPictures',
                    backdrop: false,
                    controller: "editPictureCtrl",
                    resolve: {
                        params: function() {
                            var params = {
                                image: image
                            };
                            return params;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    if (angular.isFunction(success)) {
                        success(result);
                    }
                });
            },
            /**
             * [dataURLtoBlob description]base64转为blob
             * @param  {[string]} dataurl [description] base64图片路径
             * @return {[Blob]}  blob对象 [description] 获取blob对象
             */
            //将DataUrl 转换成blob
            dataURLtoBlob: function(dataurl) {
                return dataURLtoBlob(dataurl);
            },
            /**
             * [compressImg description]压缩图片
             * @param  {[string]} width [description] 压缩宽度
             * @param  {[string]} height [description] 压缩高度
             * @return {[string]}  blob对象 [description] 图片返回信息
             */
            compressImg: function(imgSrc, width, height) {
                var deffer = $q.defer();
                var fileName = getFileName(imgSrc);
                var folderext = getFolderext(fileName);
                var params = {
                    serviceid: "mlf_image",
                    methodname: "scaleImage",
                    SCALEWIDTH: Math.round(width),
                    SCALEHEIGHT: Math.round(height),
                    FILENAME: fileName,
                    FOLDEREXT: folderext
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    deffer.resolve("/wcm/file/read_image.jsp?FileName=" + data.FN);
                });
                return deffer.promise;
                /*var imgType = getImageType(imgSrc);
                var deffer = $q.defer();
                var canvas = document.createElement("canvas");
                var img = new Image();
                img.src = imgSrc;
                img.onload = function() {
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                    var url = canvas.toDataURL('image/' + imgType);
                    deffer.resolve(url);
                };
                return deffer.promise;*/
            },
            /**
             * [ScaleWatermark description]缩放水印
             * @param  {[string]} watermark [description] 水印图片地址
             * @param  {[string]} width [description] 压缩宽度
             * @param  {[string]} height [description] 压缩高度
             * @param  {[float]} opacity [description] 水印透明度
             * @return {[string]}  url [description] 新的水印图像
             */
            ScaleWatermark: function(watermark, width, height, opacity) {
                var imgType = getImageType(watermark);
                var deffer = $q.defer();
                var canvas = document.createElement("canvas");
                var img = new Image();
                img.src = watermark;
                img.onload = function() {
                    canvas.width = width;
                    canvas.height = height;
                    var context = canvas.getContext("2d");
                    context.globalAlpha = opacity;
                    context.drawImage(img, 0, 0, width, height);
                    var url = canvas.toDataURL('image/' + imgType);
                    submitDatabase64Url(url).then(function(data) {
                        deffer.resolve(data.imgSrc.replace(/ScaleWidth=600&/g, ""));
                    });
                };
                return deffer.promise;
            },
            /**
             * [submitDatabase64Url description]提交database64图片数据
             * @return {[string]}  blob对象 [description] 图片返回信息
             */
            submitDatabase64Url: function(databaseUrl) {
                var deffer = $q.defer();
                submitDatabase64Url(databaseUrl).then(function(data) {
                    deffer.resolve(data);
                });
                return deffer.promise;
            },
            /**
             * [getWatermarkList description]获取水印列表
             * @return {[string]}  blob对象 [description] 图片返回信息
             */
            getWatermarkList: function() {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_website",
                    methodname: "makeWaterMarks",
                    objectid: 0
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        deffer.resolve(data);
                    });
                return deffer.promise;
            },
            /**
             * [parseFloat description]保留小数点后两位
             * @return {[float]}  返回的小数 [description] 
             */
            parseFloat: function(num) {
                var strNum = num + "";
                if (strNum.indexOf(".") >= 0)
                    strNum = strNum.substring(0, (strNum.indexOf(".") + 3));
                return parseFloat(strNum);
            },
            /**
             * [watermark description]添加水印
             * @param  {[string]} orgImg [description] 原图地址
             * @param  {[string]} watermark [description] 水印地址
             * @param  {[int]} x [description] 横向坐标
             * @param {[int]} y [description] 纵向坐标
             * @param {[int]} opacity [description] 透明度
             * @return {[string]} url [description] 返回图片地址
             */
            watermark: function(_orgImg, watermark, x, y, opacity) {
                var deffer = $q.defer();
                var orgImg = new Image();
                orgImg.src = _orgImg;
                orgImg.onload = function() {
                    var posArray = [4, Math.round(y), Math.round(x), Math.round(orgImg.width), Math.round(orgImg.height)];
                    var params = {
                        WMPOS: posArray.join(","),
                        WMPIC: getFileName(watermark),
                        PIC: getFileName(_orgImg)
                    };
                    trsHttpService.httpServer("/wcm/app/photo/getWaterMark.jsp", params, "get").then(function(data) {
                        deffer.resolve("/wcm/file/read_image.jsp?FileName=" + data);
                    });
                };
                return deffer.promise;
                /*var imgType = getImageType(orgImg);
                var deffer = $q.defer();
                var img = new Image();
                img.src = orgImg;
                var imgWaterMark = new Image();
                imgWaterMark.src = watermark;
                img.onload = function() {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    ctx.globalAlpha = opacity;
                    setTimeout(function() { //使性能较差的电脑有时间处理图片
                        ctx.drawImage(imgWaterMark, x, y);
                        deffer.resolve(canvas.toDataURL("image/" + imgType));
                    }, 1000);
                    //window.open(canvas.toDataURL("image/png"));
                };
                return deffer.promise;*/
            },
            /**
             * [newCropper description 裁剪图片new]
             * @return {[type]} [description]
             */
            newCropper: function(src) {
                var deffer = $q.defer();
                var modalInstance = $modal.open({
                    templateUrl: "./components/service/editPicture/newCropper/newCropper_tpl.html",
                    windowClass: 'newCropper',
                    backdrop: false,
                    controller: "newCropperCtrl",
                    resolve: {
                        params: function() {
                            return {
                                imgSrc: src
                            };
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    deffer.resolve(result);
                });
                return deffer.promise;
            },
            /**
             * [newCropperPreview description 预览裁剪图片new]
             * @return {[type]} [description]
             */
            newCropperPreview: function(prevImg) {
                var deffer = $q.defer();
                var modalInstance = $modal.open({
                    templateUrl: "./components/service/editPicture/newCropper/newCropperPreview/newCropperPreview_tpl.html",
                    windowClass: 'newCropperPreview',
                    backdrop: false,
                    controller: "newCropperPreviewCtrl",
                    resolve: {
                        params: function() {
                            return {
                                prevImg: prevImg
                            };
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    deffer.resolve(result);
                });
                return deffer.promise;
            },
            /**
             * [cutPicture description]根据图片地址判断图片类型
             * @param  {[string]} src [description] 图片路径
             * @return {[string]}  type [description] 返回图片类型
             */
            getImageType: function(src) {
                return getImageType(src);
            },
            /**
             * [getFileName description]获取图片名称
             * @param  {[string]} src [description] 图片路径
             * @return {[string]}  type [description] 返回图片名称
             */
            getFileName: function(src) {
                return getFileName(src);
            }
        };
    }]);
