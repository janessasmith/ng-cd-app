/**
 * created by zss in 2017/01/10
 * 创建微信账号
 */
'use strict';
angular.module('createWxAccountModule', [])
    .controller('createWxAccountCtrl', ['$timeout', '$scope', '$validation', '$modalInstance', 'account', 'title', 'trsHttpService', 'editingCenterService', 'trsconfirm', 'initSingleSelecet',
        function($timeout, $scope, $validation, $modalInstance, account, title, trsHttpService, editingCenterService, trsconfirm, initSingleSelecet) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.account = account ? angular.copy(account) : {};
                $scope.data = {
                    wxPublicNumType: {
                        '1': {
                            name: '服务号',
                            value: '1'
                        },
                        '2': {
                            name: '订阅号',
                            value: '2'
                        }
                    },
                };
                $scope.status = {
                    modalTitle: title,
                    wxHeadPath: account ? $scope.account.wxHeadImg : '',
                    progress:0,
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                initDropDown();
                $scope.callBack = {
                    success: function(file, src, uploader) {
                        $timeout(function() {
                            $scope.status.wxHeadPath = src.imgSrc;
                        });
                        $scope.account.wxHeadImg = src.imgName;
                    },
                    error: function(file) {
                        trsconfirm.alertType('上传失败', '', 'error', false, function() {});
                    },
                    file: function(file, uploader) {},
                    tar: function(file, percentage) {
                        var per = Math.ceil(percentage * 100) + "%";
                        $timeout(function() {
                            $scope.status.progress = per;
                        });
                    },
                    comp: function(file) {}
                };
            }
            /**
             * [initDropDown description] 初始化下拉框
             * @return {[type]} [description] null
             */
            function initDropDown() {
                // 公众号类型
                $scope.publicNumberTypeJson = initSingleSelecet.weixinPublicNumberType();
                $scope.publicNumberTypeSelected = account ? $scope.data.wxPublicNumType[$scope.account.wxType] : angular.copy($scope.publicNumberTypeJson[0]);
            }
            /**
             * [deleteWxHead description] 删除头像
             * @return {[type]}         [description] null
             */
            // $scope.deleteWxHead = function() {
            //     $timeout(function() {
            //         $scope.status.wxHeadPath =null;
            //     },200);
            //     $scope.account.wxHeadImg = '';
            // };
            /**
             * [dealAccountBeforeSave description] 保存前处理账号信息
             * @return {[type]} [description] null
             */
            function dealAccountBeforeSave() {
                if (!$scope.account.wxHeadImg) {
                    trsconfirm.alertType("头像未上传", "支持格式 “.gif/.jpg/.jpeg/.bmp/.png”", "warning", false);
                    return;
                }
                $scope.account.serviceid = "wcm61_wxaccount";
                $scope.account.methodname = $scope.account.channelId ? "updateAccount" : "bindAccount";
                $scope.account.wxChannelId = $scope.account.channelId;
                $scope.account.ObjectId = $scope.account.id;
                $scope.account.wxType = $scope.publicNumberTypeSelected.value;
                if ($scope.account.channelId) {
                    $scope.account.wxHeadImg = $scope.account.wxHeadImg.split('/').pop();
                }
            }
            /**
             * [confirm description] 保存账号信息
             * @return {[type]} [description] null
             */
            $scope.confirm = function() {
                $validation.validate($scope.createGroupSubmitForm)
                    .success(function() {
                        dealAccountBeforeSave();
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.account, 'post').then(function(data) {
                            trsconfirm.saveModel("保存成功", "", "success");
                            $modalInstance.close(data);
                        });
                    }).error(function() {
                        trsconfirm.alertType("保存失败", "请检查填写项", "error", false);
                    });
            };
            /**
             * [cancel description] 关闭弹窗
             * @return {[type]} [description] null
             */
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        }
    ]);
