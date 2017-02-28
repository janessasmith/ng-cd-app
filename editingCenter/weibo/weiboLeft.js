/**
 * createdBy SMG 2016-7-14
 * weibo模块左侧
 */
"use strict";
angular.module('editingCenterWeiBoLeftModule', [])
    .controller('weiboLeftCtrl', ['$scope', '$q', '$state', '$filter', '$stateParams', '$location', 'trsHttpService', 'editingCenterWeiBoService',
        function($scope, $q, $state, $filter, $stateParams, $location, trsHttpService, editingCenterWeiBoService) {
            initStatus();
            initData();

            function initStatus() {
                $scope.router = $location.path().split('/');
                $scope.status = {
                    selectedItem: $scope.router[3] || "",
                    isdownPicShow: false,
                    channels: "",
                    selectedChnl: "",
                };
            }

            function initData() {
                initWeiBoAccounts();
            }

            /**
             * [setWeiBoSelectedItem description] 选择左侧栏
             * @param {[type]} item [description]
             */
            $scope.setWeiBoSelectedItem = function(item) {
                $scope.status.selectedItem = item;
                $state.go('editctr.weibo.' + $scope.status.selectedItem, { fctype: $scope.status.weiboAccessAuthority.FACHUDEPINGLUN, sdtype: $scope.status.weiboAccessAuthority.SHOUDAODEPINGLUN, atwopltype: $scope.status.weiboAccessAuthority.ATWODEPINGLUN, atwotype: $scope.status.weiboAccessAuthority.ATWODEWEIBO }, { reload: "editctr.weibo." + $scope.status.selectedItem });
            };

            /**
             * [initWeiBoChnl description] 初始化左侧栏
             * @return {[type]} [description]
             */
            function initWeiBoAccounts() {
                var params = {
                    serviceid: "mlf_mediasite",
                    methodname: "queryWebSitesByMediaType",
                    SiteId: "",
                    MediaType: 5
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        $scope.status.channels = data.DATA;
                        var filteredChnl = $filter('filterBy')(data.DATA, ['ACCOUNTID'], $location.search().accountid);
                        $scope.status.selectedChnl = filteredChnl.length > 0 ? filteredChnl[0] : data.DATA[0];
                        // $scope.status.selectedChnl = data.DATA[0];
                        getWeiBoAccessAuthority().then(function() {
                            autoRouter();
                        });
                    });
            }
            /**
             * [getWeiBoAccessAuthority description] 获取微博的权限
             * @return {[type]} [description] promise
             */
            function getWeiBoAccessAuthority() {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryCanOperOfMicroblog",
                    MicroBlogId: $scope.status.selectedChnl.ACCOUNTID
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    deffer.resolve(data);
                    $scope.status.weiboAccessAuthority = data;
                });
                return deffer.promise;
            }

            //选择微博渠道的栏目
            $scope.setWeiboSelected = function(channel) {
                if ($scope.status.selectedChnl === channel) return;
                $scope.status.selectedChnl = channel;
                getWeiBoAccessAuthority().then(function() {
                    autoRouter();
                });
            };
            /**
             * [autoRouter description] 获取平台权限，并自动跳转到有权限的平台
             * @return {[type]} [description] promise
             */
            function autoRouter() {
                var authority = $scope.status.weiboAccessAuthority;
                for (var i in authority) {
                    var router = editingCenterWeiBoService.autoRouter()[i];
                    $state.go("editctr.weibo." + router, { accountid: $scope.status.selectedChnl.ACCOUNTID }, { reload: "editctr.weibo." + router });
                    $scope.status.selectedItem = router;
                    break;
                }
            }
            /**
             * [siteCut description]  根据不同分辨率截取不同长度的名称
             * @param {[type]} site [description]
             */
            $scope.siteCut = function(site) {
                if (window.screen.width <= '1366') {
                    site = $filter('trsLimitTo')(site, '8');
                } else if (window.screen.width <= '1680' && window.screen.width > '1366') {
                    site = $filter('trsLimitTo')(site, '10');
                } else if (window.screen.width > '1680') {
                    site = $filter('trsLimitTo')(site, '12');
                }
                return site;
            };
        }
    ]);
