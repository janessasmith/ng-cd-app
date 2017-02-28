"use strict";
/*
    modify By cc 16-11-22
 */
angular.module('iWoLeftModule', [])
    .controller('iWoLeftCtrl', ['$scope', '$rootScope', '$timeout', '$filter', '$state', '$location', '$q', 'trsHttpService', 'localStorageService', 'iWoService',
        function($scope, $rootScope, $timeout, $filter, $state, $location, $q, trsHttpService, localStorageService, iWoService) {
            initStatus();
            if ($scope.pathes.length === 3) {
                $state.go("editctr.iWo.personalManuscript");
            }
            initData();

            function initStatus() {
                $scope.pathes = $location.path()
                    .split('/');
                $scope.status = {
                    iwoAccessAuthority: "",
                    isMyManuscriptShow: true,
                    selectedItem: $scope.pathes[3] || "personalManuscript",
                    isUsualOpened: $location.search().customid ? true : false,
                    authority: {},
                    customItems: [],
                    departments: [],
                    selectedUnit: {}, //选择的一级单位
                    openedPanel: {}
                };
            }

            function initData() {
                getIwoAuthority();
                requestCustomList();
                return getUnits().then(function() {
                    if ($state.params.departmentid) openDefaultUnit();
                }); //类似链式调用的语法糖
            }
            /**
             * [iwoCustomRouter description]iwo常用资源自定义路由
             * @param  {[object]} item  [description]当前条目
             */
            $scope.iwoCustomRouter = function(item) {
                var router = item.CUSTOM == "邮件稿" ? "editctr.iWo.emaildraft" : "editctr.iWo.custom";
                $state.go(router, {
                    'customid': item.CUSTOMID,
                    'customtype': item.CUSTOMTYPE,
                    'mycustomid': item.MYCUSTOMID
                });
            };
            /**
             * [getIwoAccessAuthority description]获取IWO的访问权限
             * @return {[type]} [description] promise
             */
            function getIwoAuthority() {
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryCanOperIWOModals",
                    classify: "iwo"
                };
                var defer = $q.defer();
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    $scope.status.authority = data;
                    defer.resolve();
                });
                return defer.promise;
            }
            $scope.setIWoSelectedChnl = function(item) {
                $scope.status.selectedItem = item;
                if (item === 'receivedManuscript') {
                    $rootScope.$emit('lastUnreadTime');
                    localStorageService.set("unreadCount", localStorageService.get('unreadCount') - 1);
                }
            };
            /**
             * [requestCustomList description:初始化自定义列表]
             */
            function requestCustomList() {
                var params = {
                    serviceid: 'mlf_releasesource',
                    methodname: 'queryMyCustoms'
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    $scope.status.customItems = data.DATA;
                });
            }
            /**
             * [panelFilter description]单位过滤器
             * @param  {[obj]} elm  [description]单位信息
             * @return {[type]}     [description]
             */
            $scope.unitFilter = function(elm) {
                if (elm) {
                    return elm.DEPARTMENTID == $state.params.parentid;
                }
            };
            /**
             * [departmentFilter description]部门过滤器
             * @param  {[obj]} elm  [description]部门信息
             * @return {[type]}     [description]
             */
            $scope.departmentFilter = function(elm) {
                if (elm) {
                    return elm.DEPARTMENTID == $state.params.departmentid;
                }
            };
            /**
             * [getDepartment description]获得一级单位
             * @return {[type]} [description]
             */
            function getUnits() {
                var defferd = $q.defer();
                var params = {
                    serviceid: "nb_departmentrelease",
                    methodname: "queryUnits",
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    $scope.status.departments = data.DATA ? data.DATA : data;
                    defferd.resolve();
                });
                return defferd.promise;
            }
            /**
             * [getDepartment description]获取部门列表
             * @param  {[num]} departmentid  [description]部门ID
             * @return {[type]}              [description]
             */
            function getDepartment(unitid) {
                var defferd = $q.defer();
                var params = {
                    serviceid: "nb_departmentrelease",
                    methodname: "queryDepartments",
                    UnitId: unitid,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    defferd.resolve(data);
                });
                return defferd.promise;
            }
            /**
             * [openDefaultUnit description]F5刷新时打开默认单位面板
             * @return {[type]} [description]
             */
            function openDefaultUnit() {
                var unit; //被选中的单位
                if ($state.params.parentid) {//是否存在部门
                    unit = $filter('pick')($scope.status.departments, $scope.unitFilter);
                } else {
                    unit = $filter('pick')($scope.status.departments, $scope.departmentFilter);
                }
                if (unit.length < 1) return;
                var index = $scope.status.departments.indexOf(unit[0]);
                unit[0].isOpen = true; //打开默认模板
                $scope.status.selectedUnit = $scope.status.departments[index]; //选择默认单位
                getDepartment(unit[0].DEPARTMENTID).then(function(data) {
                    unit[0].CHILDREN = data.DATA ? data.DATA : data;
                    $scope.status.selectedItem = $filter('pick')(unit[0].CHILDREN, $scope.departmentFilter)[0]; //选择默认部门
                });
            }
            /**
             * [getChildDepartments description]点击一级单位
             * @param  {[obj]} department  [description]单位信息
             * @return {[type]}            [description]
             */
            $scope.getChildDepartments = function(department) {
                $scope.status.selectedItem = null; //点击单位时去除选中的部门避免歧义
                if (department.QUGAO == "true") routerToUnitList(department); //如果有取稿权限跳转到单位列表页
                // $scope.status.selectedUnit = department == $scope.status.selectedUnit ? null : department;
                $scope.status.selectedUnit = department;
                if (department.CHILDREN) return;
                getDepartment(department.DEPARTMENTID).then(function(data) {
                    department.CHILDREN = data.DATA ? data.DATA : data;
                });
            };
            /**
             * [routerToUnit description]跳转到单位列表页
             * @param  {[obj]} department  [description]单位信息
             * @return {[type]}            [description]
             */
            function routerToUnitList(department) {
                var departmentInfo = {
                    unitName: department.DEPARTMENTNAME,
                };
                localStorageService.set("iWodepartmentInfo", departmentInfo); //将部门和单位信息存储在缓存中
                $state.go('editctr.iWo.department', {
                    departmentid: department.DEPARTMENTID,
                    parentid: null,
                });
            }
            /**
             * [selelcedDraft description]点击二级部门
             * @param  {[obj]} item   [description]部门信息
             * @param  {[obj]} event  [description]事件对象
             * @return {[type]}       [description]
             */
            $scope.selelcedDraft = function(item, event) {
                $scope.status.selectedItem = item;
                var departmentInfo = {
                    departmentName: item.DEPARTMENTNAME,
                    unitName: $scope.status.selectedUnit.DEPARTMENTNAME
                };
                localStorageService.set("iWodepartmentInfo", departmentInfo); //将部门和单位信息存储在缓存中
                event.stopPropagation();
            };
        }
    ]);
