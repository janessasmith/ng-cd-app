/**
 * created by zss in 2016/12/24
 * 官员详细
 */
"use strict";
angular.module('editingCenterAppOfficialDetailModule', [])
    .controller('editingCenterAppOfficialDetailCtrl', ['$scope', '$state','$stateParams', '$window', '$filter', 'trsHttpService', 'editcenterRightsService',
        function($scope, $state,$stateParams, $window, $filter, trsHttpService, editcenterRightsService) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.status = {
                    params: {
                        'serviceid': 'nb_appofficer',
                        'methodname': 'findOfficerById',
                        'ChannelId': $state.params.channelid,
                        'CHNLDOCID': $state.params.officerid,
                    },
                    officerstatus: $state.params.officerstatus,
                    rightsStatus: {
                        'tobecompiled': 'app.daibian',
                        'pending': 'app.daishen',
                        'signed': 'app.yiqianfa',
                    }, //待编,待审,已签发状态下对应的权限
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                requestData();
                editcenterRightsService.initAppListBtn($scope.status.rightsStatus[$state.params.officerstatus], $stateParams.channelid).then(function(rights) {
                    $scope.status.btnRights = rights;
                });
            }
            /**
             * [requestData description] 数据请求
             * @return {[type]} [description] null
             */
            function requestData() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, "post").then(function(data) {
                    $scope.officer = data;
                    filterDate($scope.officer);
                });
            }
            /**
             * [filterDate description] 将date对象转成'yyyy年MM月'形式字符串
             * @param  {[type]} object [description] officer对象
             * @return {[type]} null
             */
            function filterDate(officer) {
                officer.BIRTHDAY = $filter('date')(officer.BIRTHDAY, 'yyyy年MM月');
                officer.PARTYDATE = $filter('date')(officer.PARTYDATE, 'yyyy年MM月');
                officer.WORKTIME = $filter('date')(officer.WORKTIME, 'yyyy年MM月');
                for (var i = 0; i < officer.RECORDS.length; i++) {
                    officer.RECORDS[i].FROMDATE = $filter('date')(officer.RECORDS[i].FROMDATE, 'yyyy年MM月');
                    officer.RECORDS[i].UNTILDATE = $filter('date')(officer.RECORDS[i].UNTILDATE, 'yyyy年MM月');
                    if (officer.RECORDS[i].UNTILDATE === '') {
                        officer.RECORDS[i].UNTILDATE = '至今';
                        officer.incumbent = officer.RECORDS[i].CONTENT;
                    }
                }
            }
            /**
             * [edit description] 编辑
             * @return {[type]} [description] null
             */
            $scope.edit = function() {
                $state.go('appofficial', { 'channelid': $state.params.channelid, 'officerid': $state.params.officerid, 'officerstatus': $scope.status.officerstatus });
            };
            /**
             * [close description]页面关闭
             * @return {[type]} [description] null
             */
            $scope.close = function() {
                $window.open('about:blank', '_self').close();
            };
        }
    ]);
