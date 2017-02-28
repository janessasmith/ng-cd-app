/**
 * 图片详情查看
 * Created by XueXiaoting in 2016/12/12.
 */
"use strict";
angular.module("resourceCenterVideoDetailModule", [])
    .controller("resourceCenterVideoDetailCtrl", ['$scope', '$state', '$window', '$stateParams', 'trsHttpService', 'trsspliceString',  
        function($scope, $state, $window, $stateParams, trsHttpService, trsspliceString) {
            initStatus();
            initData();
            //$state.params videoid,materialtypeid,topclassifyid
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.data = {};
                $scope.status = {
                    params: {
                        'serviceid': 'nb_materialrelease',
                        'methodname': 'queryVideoFromMas',
                        'materialId': $state.params.videoid,
                        'MaterialTypeID': $state.params.materialtypeid,
                    }
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                if ($state.params.videoid) {
                    requestData();
                }
            }
            /**
             * [requestData description] 数据请求
             * @return {[type]} [description]
             */
            function requestData() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, "post")
                .then(function(data) {
                    $scope.data.videoInfo = data;
                    materialTypeString();
                });
            }
            /**
             * [materialTypeString description] 获取所属分类字符串
             * @return {[type]} [description] null
             */
            function materialTypeString() {
                $scope.data.typeString = trsspliceString.spliceString($scope.data.videoInfo.MATERIALTYPE,'TITLE',',');
            }
            /**
             * [close description]页面关闭
             * @return {[type]} [description]
             */
            $scope.close = function() {
                var opened = $window.open('about:blank', '_self');
                opened.close();
            };
            /**
             * [edit description]跳转到编辑
             * @return {[type]} [description]null
             */
            $scope.edit = function() {
                $state.go('resourcevideoedit', {
                    videoid: $state.params.videoid,
                    materialtypeid: $state.params.materialtypeid,
                    topclassifyid:$state.params.topclassifyid
                }, { reload: true });
            };
        }
    ]);
