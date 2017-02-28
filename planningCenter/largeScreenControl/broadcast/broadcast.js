"use strict";
/*
author:zhou
date:2016-08-01
 */
angular.module("largeScreenControlBroadcastModule", ["largeScreenControlBroadcastRouterModule", "broadcastServiceModule"])
    .controller('largeScreenControlBroadcastCtrl', 
        function($scope, $state, $location, dateFilter, trsspliceString, plancenterService, planCtrModalService, permissionService) {
        var vm = $scope.vm = {
            pageParams: {
                PageId: 1,
                PageSize:20
            },
            pager: {
                CURRPAGE: 1
            },
            time: {
                values: [{ value: '', name: '全部' },
                    { value: '1M', name: '近一个月' },
                    { value: '3M', name: '近三个月' }
                ],
                curValue: { value: '', name: '全部' }
            },
            towho: {
                values: [{ value: '', name: '全部' },
                    { value: '1', name: '部门' },
                    { value: '2', name: '多人' }
                ],
                curValue: { value: '', name: '部门' }
            },
            searchObj: {
                values: [{ value: 'TITLE', name: '标题' },
                    { value: 'CONTENT', name: '内容' } 
                ],
                curValue: { value: 'TITLE', name: '标题' }
            },
            type: {
                values: '',
                curValue: ''
            },
            keyword: '',
        };
        permissionService.isAdministrator().then(function(data){ //是否是系统管理员
            $scope.vm.isAdministrator = data;
        });
        var init = function() {
            $scope.infotype = ['已读', '未读', '接受', '转发'];
            getPlanInfo();
            plancenterService.infoinvoke('queryAllInfoTypes').then(function(res) {
                vm.type.values = [{ 'INFORTYPEID': '', 'VALUE': '全部' }].concat(res);
                vm.type.curValue = { 'INFORTYPEID': '', 'VALUE': '全部' };
            });
            $scope.$watch("$parent.initStatus.rwzl.ggxx", function(newV, oldV) {
                getInfAssignRights();
            });

        };
        var getPlanInfo = function() {
            var params = angular.copy(vm.pageParams);
            params.Flag = vm.towho.curValue.value;
            params.PUBDATE = vm.time.curValue.value;
            params.INFOTYPE = vm.type.curValue.INFORTYPEID;
            params[vm.searchObj.curValue.value] = vm.keyword;
            plancenterService.infoinvoke('queryVoiceOwnerPlanInformations', params).then(function(res) {
                vm.infos = res.DATA;
                vm.pager = res.PAGER;
            });
        };
        $scope.searchInfos = function() {
            vm.pageParams.jumptoPage = vm.pageParams.PageId = 1;
            getPlanInfo();
        }
        $scope.createNewinfo = function() {
            var createModal = planCtrModalService.createBroadcastInfo(function(info) {
                plancenterService.infoinvoke('saveInformation', info).then(function(data) {
                    getPlanInfo();
                });

            });
        };
        $scope.viewInfo = function(info) {
            var viewInfoModal = planCtrModalService.viewInfo(info);
        };

        $scope.pageChanged = function() {
            vm.pageParams.jumptoPage = vm.pageParams.PageId = vm.pager.CURRPAGE;
            getPlanInfo();
        };
        $scope.jumptoPage = function() {
            vm.pageParams.PageId = vm.pageParams.jumptoPage;
            getPlanInfo();
        }

        $scope.toggleTask = function(info) {
            info.ischecked = !info.ischecked;
        };
        init();
        //获取信息指派权限
        function getInfAssignRights() {
            $scope.rights = angular.isUndefined($scope.$parent.initStatus.rwzl) ? undefined : $scope.$parent.initStatus.rwzl.ggxx;
        }
    }).controller('infoViewCtrl', function($scope, $state, $location, trsspliceString, plancenterService, planCtrModalService, localStorageService) {
        var vm = $scope.vm = {
            pageParams: {
                CURRPAGE: 1,
                PageSize:20
            },
            pager: {
                CURRPAGE: 1
            },
            time: {
                values: [{ value: '', name: '全部' },
                    { value: '1M', name: '近一个月' },
                    { value: '3M', name: '近三个月' }
                ],
                curValue: { value: '', name: '全部' }
            },
            towho: {
                values: [{ value: '', name: '全部' },
                    { value: '1', name: '部门' },
                    { value: '2', name: '多人' }
                ],
                curValue: { value: '', name: '部门' }
            },
            searchObj: {
                values: [{ value: 'TITLE', name: '标题' },
                    { value: 'CONTENT', name: '内容' } 
                ],
                curValue: { value: 'TITLE', name: '标题' }
            },
            type: {
                values: '',
                curValue: ''
            },
            keyword: ''
        };
        var nearlytime = localStorageService.get('infonearlytime', new Date().getTime());
        localStorageService.set('infonearlytime', new Date().getTime());
        var init = function() {
            $scope.infotype = ['已读', '未读', '接受', '转发'];
            getPlanInfo();
            plancenterService.infoinvoke('queryAllInfoTypes').then(function(res) {
                vm.type.values = [{ 'INFORTYPEID': '', 'VALUE': '全部' }].concat(res);
                vm.type.curValue = { 'INFORTYPEID': '', 'VALUE': '全部' };
            });
        };
        var getPlanInfo = function() {
            var params = angular.copy(vm.pageParams);
            params.Flag = vm.towho.curValue.value;
            params.PUBDATE = vm.time.curValue.value;
            params.INFOTYPE = vm.type.curValue.INFORTYPEID;
            params[vm.searchObj.curValue.value] = vm.keyword;
            plancenterService.infoinvoke('queryPlanInformations', params).then(function(res) {
                vm.infos = res.DATA;
                vm.pager = res.PAGER;
            });
        };
        $scope.searchInfos = function() {
            vm.pageParams.jumptoPage = vm.pageParams.CURRPAGE = 1;
            getPlanInfo();
        }
        $scope.checkunread = function(info) {
            return new Date(info.CRTIME).getTime() > nearlytime;
        }
        $scope.viewInfo = function(info) {
            var viewInfoModal = planCtrModalService.viewInfo(info);
        };

        $scope.pageChanged = function() {
            vm.pageParams.jumptoPage = vm.pageParams.CURRPAGE = vm.pager.CURRPAGE;
            getPlanInfo();
        };
        $scope.jumptoPage = function() {
            vm.pageParams.CURRPAGE = vm.pageParams.jumptoPage;
            getPlanInfo();
        }
        init();
    }).controller('infoTypeCtrl', function($scope, $state, $location, trsspliceString, plancenterService, planCtrModalService, trsconfirm, SweetAlert) {
        var vm = $scope.vm = {
            pageParams: {
                PageId: 1,
                PageSize:20
            },
            pager: {
                CURRPAGE: 1,
                PAGESIZE: 20
            },
            isAllchecked: false,
        };
        var init = function() {
            $scope.infotype = ['已读', '未读', '接受', '转发'];
            getInfoTypes();
        };
        var getInfoTypes = function() {
            plancenterService.infoinvoke('queryInfoTypes', vm.pageParams).then(function(res) {
                vm.infoTypes = res;
                //vm.pager = res.PAGER;
            });
        }

        var refreshInfowithMsg = function(msg) {
            SweetAlert.swal(msg, "", "success");
            getInfoTypes();
        }


        $scope.createNewinfoType = function() {
            planCtrModalService.createInfoType().result.then(function(result) {
                if (result.ISSUCCESS === 'true') {
                    refreshInfowithMsg('新增类型成功');
                }
            });
        }

        $scope.editInfoType = function(type) {
            planCtrModalService.editInfoType(type).result.then(function(result) {
                if (result.ISSUCCESS === 'true') {
                    refreshInfowithMsg('修改消息成功');
                }
            });
        }
        $scope.deleteInfoType = function() {
            var selIfotypes = trsspliceString.where(vm.infoTypes, { ischecked: true });
            if (selIfotypes.length === 0) {
                trsconfirm.alertType("请先选择要删除的信息类型", "", "error", false, "");
                return false;
            }
            var ids = trsspliceString.getValuesBykey(selIfotypes, 'INFORTYPEID').join(',');
            trsconfirm.alert({
                title: "确定要删除这些类型",
                type: 'warning',
                closeOnConfirm: false,
            }, function(isConfirm) {
                if (isConfirm) {
                    plancenterService.infoinvoke('delInfoTypes', { TypeIds: ids }).then(function(data) {
                        if (data.ISSUCCESS === 'true') {
                            refreshInfowithMsg('删除类型成功！');
                        }
                    });
                }
            });
        }
        $scope.deleteInfoTypeById = function(id) {
            trsconfirm.alert({
                title: "确定要删除此类型",
                type: 'warning',
                closeOnConfirm: false,
            }, function(isConfirm) {
                if (isConfirm) {
                    plancenterService.infoinvoke('delInfoTypes', { TypeIds: id }).then(function(data) {
                        if (data.ISSUCCESS === 'true') {
                            refreshInfowithMsg('删除类型成功！');
                        }
                    });
                }
            });

        }
        $scope.toggleAllcheck = function(isAllchecked) {
            vm.isAllchecked = !isAllchecked;
            angular.forEach(vm.infoTypes, function(item) {
                item.ischecked = vm.isAllchecked;
            });
        }

        $scope.toggleInfoType = function(infotype) {
            var ischecked = infotype.ischecked = !infotype.ischecked;
            if (ischecked) {
                var lengthOfchecked = trsspliceString.filterArr(vm.infoTypes, '', 'ischecked', true).length;
                if (lengthOfchecked === vm.infoTypes.length) {
                    vm.isAllchecked = true;
                }
            } else {
                vm.isAllchecked = false;
            };
        }
        init();
    });
