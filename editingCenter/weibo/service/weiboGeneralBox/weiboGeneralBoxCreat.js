/**
 *  weiboToBeCompiledCreatModule
 *
 * Description 
 * rebuild:SMG 2016-7-20
 */
"use strict";
angular.module('weiboGeneralBoxCreatModule', ['ngFileUpload']).
controller('weiboGeneralBoxCreatCtrl', ['$scope', '$stateParams', '$modalInstance', '$http', '$filter', '$validation', 'trsHttpService', 'trsconfirm', 'trsspliceString', 'editcenterRightsService',
    function($scope, $stateParams, $modalInstance, $http, $filter, $validation, trsHttpService, trsconfirm, trsspliceString, editcenterRightsService) {
        initStatus();
        initData();

        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description] null
         */
        function initStatus() {
            $scope.status = {
                Picture: [],
                weiboExpression: false, //微博表情图片控制显示隐藏
                weiboUploaderImg: false, //微博上传图片控制显示隐藏
                weiboTimeSign: false, //微博定时发控制显示隐藏
                oneImageWordNum: 140, //微博还可以输入140字
                weiboForward: false, //微博转发按钮显示隐藏
                content: "",
                btnRights: []
            };
            $scope.data = {
                expressions: [], //微博表情
                obj: eval("(" + localStorage.getItem("weibo.microblogWindow") + ")")
            };

        }
        /**
         * [initData description] 初始化数据
         * @return {[type]} [description] null
         */
        function initData() {
            insertImgData();
            initBtnRights();
            if ($scope.data.obj.SCMMicroContentId) {
                //编辑
                $scope.params = {
                    "serviceid": "wcm61_scmmicrocontent",
                    "methodname": "findByIdToJson",
                    "ObjectId": $scope.data.obj.SCMMicroContentId
                };
                trsHttpService.httpServer('/wcm/rbcenter.do', $scope.params, "get").then(function(data, $index) {
                    $scope.status.content = data.CONTENT;
                    if (data.IMGS === '') {
                        $scope.status.Picture = [];
                        $scope.status.Picture = doWithPicsOrAttach($scope.status.Picture);
                    } else {
                        $scope.status.Picture = data.IMGS;
                    }
                    if (data.IMGS.length > 0) {
                        $scope.status.weiboUploaderImg = !$scope.status.weiboUploaderImg;
                    }
                });
            } else {
                //新建
                $scope.status.Picture = doWithPicsOrAttach($scope.status.Picture);
            }
        }

        /**
         * [insertImgData description]  微博表情包
         * @return {[type]} [description]
         */
        function insertImgData() {
            $http.get("./editingCenter/weibo/toBeCompiled/data/sinaface.json").success(function(data) {
                if ($scope.data.obj.Platform == 'Sina') {
                    $scope.data.expressions = data.SINA;
                } else {
                    $scope.data.expressions = data.TENCENT;
                }
            });
        }

        /**
         * [insertImg description]  微博插入表情
         * @param  {[type]} expression [description]
         * @return {[type]}            [description]
         */
        $scope.insertImg = function(expression) {
            var textobj = document.getElementById('contentid'); //$("html").find("#contentid");
            var data = expression.data;
            insertAtCursor(textobj, data, "expression");
            $scope.status.weiboExpression = !$scope.status.weiboExpression;
        };

        /**
         * [insertAtCursor description]  微博插入表情方法
         * @param  {[type]} myField [description]    
         * @param  {[type]} myValue [description]
         * @return {[type]}         [description]
         */
        function insertAtCursor(myField, myValue, type) {
            //IE support
            if (document.selection) {
                myField.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
                sel.select();
            } else if (myField.selectionStart || myField.selectionStart == '0') {
                var startPos = myField.selectionStart;
                var endPos = myField.selectionEnd;
                // save scrollTop before insert
                var restoreTop = myField.scrollTop;
                $scope.status.content = myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
                // myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
                if (restoreTop > 0) {
                    // restore previous scrollTop
                    myField.scrollTop = restoreTop;
                }
                myField.focus();
                myField.selectionStart = type == "expression" ? startPos + myValue.length : startPos + myValue.length - 1;
                myField.selectionEnd = type == "expression" ? startPos + myValue.length : startPos + myValue.length - 1;
            } else {
                $scope.status.content = myField.value += myValue;
                myField.focus();
            }
        }

        /**
         * [topic description] 微博话题
         * @return {[type]} [description]
         */
        $scope.topic = function() {
            var topicobj = document.getElementById('contentid'); //$("html").find("#contentid");
            var data = '##';
            insertAtCursor(topicobj, data, "topic");
        };


        /**
         * [addUploaderImg description] 图片上传
         * @param {[type]} array [description]
         */
        $scope.addUploaderImg = function(array, type) {
            if (array.length > 8) {
                trsconfirm.alertType(type + "最多支持9张", "", "error", false);
                return;
            }
            array.push({
                "imgName": ""
            });
        };

        /**
         * [deleteImgContainer description]删除图片容器
         * @param  {[obj]} item  [description]要删除的某项
         * @param  {[obj]} array [description]要删除的图片数组
         * @return {[type]}       [description]null
         */
        $scope.deleteImgContainer = function(item, array) {
            array.splice(array.indexOf(item), 1);
        };

        //编辑中，初始化处理图片或者附件
        function doWithPicsOrAttach(array) {
            //处理READINGPICS字段为空数组的情况，防止相关图片框消失。
            if (array.length === 0) {
                array = [{
                    "imgName": ""
                }];
            }
            return array;
        }


        /**
         * [save description]    保存、送审、发布、转发
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        $scope.save = function(type) {
            var sharedDate = $scope.status.sharedDate ? $filter('date')($scope.status.sharedDate, 'yyyy-MM-dd HH:mm:ss') : "";
            var j = $scope.status.Picture.length - 1;
            while (j >= 0) {
                if ($scope.status.Picture[j].imgName === "") {
                    $scope.status.Picture.splice(j, 1);
                }
                j--;
            }
            var PictureNames = trsspliceString.spliceString($scope.status.Picture, "imgName", ",");
            var tip = type == "save" && "保存成功" || type == 'submit' && "送审成功" || type == 'release' && "发布成功" || type == 'zhuanfa' && "转发成功";
            $scope.params = {
                "serviceid": "wcm61_scmmicrocontent",
                "AccountIds": $stateParams.accountid,
                "SCMGroupId": 1,
                "Content": $scope.status.content,
                "Picture": PictureNames,
                "Source": "媒立方",
                "ScheduleTime": sharedDate
            };
            $scope.params.methodname = type == "save" && "saveToDaiBianToJson" || type == 'submit' && "saveToDaiShenToJson" || type == 'release' && "saveToPublishToJson" || type == 'zhuanfa' && "forwardMicroContentToJson";
            if (type = "save" && $scope.data.obj.SCMMicroContentId) {
                $scope.params.methodname = "saveToJson";
                $scope.params.ObjectId = $scope.data.obj.SCMMicroContentId;
            }
            if (type = 'zhuanfa' && $scope.data.obj.moduleName) {
                $scope.params.MicroContentId = $scope.data.obj.MicroContentId;
                $scope.params.modulename = $scope.data.obj.moduleName;
            }
            trsHttpService.httpServer('/wcm/rbcenter.do', $scope.params, "get").then(function(data) {
                trsconfirm.alertType(tip, "", "success", false, function() {
                    $modalInstance.close($scope.data.obj);
                });
            });
        };

        /**
         * [cancel description]  取消
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            if ($scope.data.obj.SCMMicroContentId) {
                unLockCancel();
            } else {
                $modalInstance.close();
            }
        };

        /**
         * [unLockCancel description]  解锁方法
         * @return {[type]} [description]
         */
        function unLockCancel() {
            $scope.params = {
                "serviceid": "wcm61_scmmicrocontent",
                "methodname": "unLockToJson",
                "ObjectId": $scope.data.obj.SCMMicroContentId
            };
            trsHttpService.httpServer('/wcm/rbcenter.do', $scope.params, "get").then(function(data) {
                $modalInstance.close();
            });
        }

        /**
         * [description]     微博字数
         * @param  {[type]} newValue) {                                   
         * newValue [description]
         * @return {[type]}           [description]
         */
        $scope.$watch('status.content', function(newValue) {
            //去除首尾空格
            newValue = newValue.replace(/(^\s*)|(\s*$)/g, "");
            var len = newValue.length;
            $scope.status.oneImageWordNum = 140 - len;
        });


        /**
         * [initBtnRights description] 初始化待编权限
         * @return {[type]} [description]
         */
        function initBtnRights() {
            editcenterRightsService.initWeiboListBtn('microblog.daibian', $stateParams.accountid).then(function(rights) {
                $scope.status.btnRights = rights;
            });
        }

        // $scope.iHeight = 391;
        // $window.addEventListener("storage", function(e) {
        //     var dataObj = eval("(" + e.newValue + ")");
        //     if (angular.isDefined(dataObj.height)) {
        //         $scope.iHeight = dataObj.height;
        //     }
        // });
    }
]);
