"use strict";
angular.module('manageconfigManageNewsModule', [])
    .controller('manageNewsCtrl', ['$scope', 'selectedItem', '$q', '$modalInstance', '$timeout', "$validation", 'trsHttpService', "initManageConSelectedService", "trsconfirm", function($scope, selectedItem, $q, $modalInstance, $timeout, $validation, trsHttpService, initManageConSelectedService, trsconfirm) {
        initStatus();
        initData();

        function initStatus() {
            $scope.params = {
                serviceid: "mlf_paperset",
                methodname: "findPaperById"
            };
            $scope.partterns = initManageConSelectedService.getPartterns();
            $scope.appearances = initManageConSelectedService.getAppearances();
            $scope.genres = initManageConSelectedService.getGenres();
            $scope.newspaper = {
                DISPLAYFGDLIST: 0,
                CHECKFGDATTRIBUTE: 0,
                ISDUOJISHEN: 1,
                ISZHAOPAI: 1,
                DATAPATH: 1,
                INCLUDEDIECI: 0,
                LIMITEDAENUMBER: 0,
                REPEATUSETIME: 0,
                CKMSIMDAYRANGE: 0,
            };
        }

        function initData() {
            selectedItem !== "" ? requestData() : "";
            selectedItem !== "" ? $scope.paperTtile = '编辑报纸' : $scope.paperTtile = '新建报纸';
        }

        function requestData() {
            $scope.params.SiteId = selectedItem.SITEID;
            var deferred = $q.defer();
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                $scope.newspaper = data;
                deferred.resolve();
            });
            return deferred.promise;
        }
        //审核模式
        $scope.selectPattern = function(pattern) {
            $scope.newspaper.ISDUOJISHEN = pattern.value;
        };
        //照排版面
        $scope.selectAppearance = function(appearance) {
            $scope.newspaper.ISZHAOPAI = appearance.value;
        };
        //招牌类型
        $scope.selectGenre = function(genre) {
            $scope.newspaper.DATAPATH = genre.value;
        };
        /**
         * [isSelectedCheckbox description]是否选中单选框
         * @param  {[type]}  key [description]属性值
         * @return {Boolean}     [description]
         */
        $scope.isSelectedCheckbox = function(key) {
            $scope.newspaper[key] = $scope.newspaper[key] == 1 ? 0 : 1;
        };
        $scope.close = function() {
            $modalInstance.dismiss();
        };
        $scope.confirm = function() {
            $validation.validate($scope.manageNewsform).success(function() {
                $scope.params.methodname = "savePaper";
                $scope.params.ObjectId = selectedItem.SITEID;
                $scope.params.SITENAME = $scope.newspaper.SITENAME;
                $scope.params.SITEDESC = $scope.newspaper.SITEDESC;
                $scope.params.WEBHTTP = $scope.newspaper.WEBHTTP;
                $scope.params.ISDUOJISHEN = $scope.newspaper.ISDUOJISHEN;
                $scope.params.ISZHAOPAI = $scope.newspaper.ISZHAOPAI;
                $scope.params.DATAPATH = $scope.newspaper.DATAPATH;
                $scope.params.DISPLAYFGDLIST = $scope.newspaper.DISPLAYFGDLIST;
                $scope.params.CHECKFGDATTRIBUTE = $scope.newspaper.CHECKFGDATTRIBUTE;
                $scope.params.LIMITEDAENUMBER = $scope.newspaper.LIMITEDAENUMBER === '' ? 0 : $scope.newspaper.LIMITEDAENUMBER;
                $scope.params.INCLUDEDIECI = $scope.newspaper.INCLUDEDIECI;
                $scope.params.REPEATUSETIME = $scope.newspaper.REPEATUSETIME === '' ? 0 : $scope.newspaper.REPEATUSETIME;
                $scope.params.CKMSIMDAYRANGE = $scope.newspaper.CKMSIMDAYRANGE === '' ? 0 : $scope.newspaper.CKMSIMDAYRANGE;
                requestData().then(function(data) {
                    $modalInstance.close("success");
                });
            }).error(function() {
                $scope.showAllTips = true;
                trsconfirm.alertType("提交失败", "请检查表单", "info", false, function() {});
            });
        };
    }])
    /**
     * Created by ZSS in 2016/11/22
     * [description] 重构报纸管理-新建/编辑报纸
     */
    .controller('manageNewspaperCtrl', ['$scope', '$filter', '$validation', '$modalInstance', 'trsHttpService', 'initManageConSelectedService', 'trsconfirm', 'selectedItem', function($scope, $filter, $validation, $modalInstance, trsHttpService, initManageConSelectedService, trsconfirm, selectedItem) {
        initStatus();
        initData();
        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description] null
         */
        function initStatus() {
            $scope.paperTtile = selectedItem ? '编辑报纸' : '新建报纸';
            $scope.newspaper = {
                'OBJECTID': 0,
                'SITENAME': '',
                'SITEDESC': '',
                'WEBHTTP': '',
                'DATAPATH': '',
                'ISZHAOPAI': '',
                'ISDUOJISHEN': '', //0代表一级审核,1多级审核
                'DISPLAYFGDLIST': 0, //1代表打勾参加审核
                'LIMITEDAENUMBER': 0, //0表示不限制
                'CHECKFGDATTRIBUTE': 0, //1代表打勾检查稿件属性
                'REPEATUSETIME': 0, //0为不限制
                'INCLUDEDIECI': 0, //1显示叠次
                'CKMSIMDAYRANGE': 0, //排重时间
            };
            $scope.params = {
                'serviceid': 'mlf_paperset',
                'methodname': 'findPaperById',
                'SiteId': selectedItem.SITEID,
            };
            $scope.data = {
                radioMap: [{
                    'key': 'selectedParttern',
                    'value': 'ISDUOJISHEN',
                }, {
                    'key': 'selectedAppearance',
                    'value': 'ISZHAOPAI',
                }, {
                    'key': 'selectedGenre',
                    'value': 'DATAPATH',
                }]
            };
            $scope.radio = {
                //审核模式
                'partterns': [],
                'selectedParttern': {},
                //照排版面
                'appearances': [],
                'selectedAppearance': {},
                //照排类型
                'genres': [],
                'selectedGenre': {},
            };
            //审核模式
            $scope.radio.partterns = initManageConSelectedService.getPartterns();
            $scope.radio.selectedParttern = angular.copy($scope.radio.partterns[1]);
            //照排版面
            $scope.radio.appearances = initManageConSelectedService.getAppearances();
            $scope.radio.selectedAppearance = angular.copy($scope.radio.appearances[0]);
            //照排类型
            $scope.radio.genres = initManageConSelectedService.getGenres();
            $scope.radio.selectedGenre = angular.copy($scope.radio.genres[0]);
        }
        /**
         * [initData description] 初始化数据
         * @return {[type]} [description] null
         */
        function initData() {
            if (selectedItem) {
                requestData();
            }
        }
        /**
         * [requestData description] 请求数据
         * @return {[type]} [description]
         */
        function requestData() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "post").then(function(data) {
                if (!data) return;
                $scope.newspaper = data;
                $scope.newspaper.OBJECTID = data.SITEID;
                setRadios(data);
            });
        }
        /**
         * [setRadios description] 设置(编辑)模态框单选按钮
         * @param {[type]} data [description] 报纸数据
         */
        function setRadios(data) {
            setRadio('partterns', data.ISDUOJISHEN, 'selectedParttern');
            setRadio('appearances', data.ISZHAOPAI, 'selectedAppearance');
            setRadio('genres', data.DATAPATH, 'selectedGenre');
        }
        /**
         * [setRadio description] 设置单个单选按钮
         * @param {[type]} array [description] 数组
         * @param {[type]} key   [description] 报纸单选按钮属性
         * @param {[type]} name  [description] 选中按钮
         */
        function setRadio(array, key, name) {
            var filteredPattern = $filter("filterBy")($scope.radio[array], ['value'], key);
            if (angular.isArray(filteredPattern) && filteredPattern.length > 0) {
                $scope.radio[name] = filteredPattern[0];
            }
        }
        /**
         * [selectRadioOpt description] 单选按钮选择
         * @param  {[type]} name [description] 报纸属性
         * @param  {[type]} value [description] 选择的单选框
         */
        $scope.selectRadioOpt = function(name, value) {
            $scope.radio[name] = value;
        };
        /**
         * [isSelectedCheckbox description] 复选框选中
         * @param  {[type]} key [description] 报纸属性,值为1代表打勾参加审核
         * @return {Boolean} [description] null
         */
        $scope.isSelectedCheckbox = function(key) {
            $scope.newspaper[key] = $scope.newspaper[key] == 1 ? 0 : 1;
        };
        /**
         * [confirmRadio description] 设置报纸单选按钮的属性值
         * @return {[type]} [description] null
         */
        function confirmRadio() {
            for (var i = 0; i < $scope.data.radioMap.length; i++) {
                $scope.newspaper[$scope.data.radioMap[i].value] = $scope.radio[$scope.data.radioMap[i].key].value;
            }
        }
        /**
         * [confirm description] 确定保存
         * @return {[type]} [description] null
         */
        $scope.confirm = function() {
            confirmRadio();
            $scope.newspaper.serviceid = 'mlf_paperset';
            $scope.newspaper.methodname = 'savePaper';
            $validation.validate($scope.manageNewsform)
                .success(function() {
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.newspaper, "post").then(function(data) {
                        $modalInstance.close("success");
                    });
                }).error(function() {
                    trsconfirm.alertType("保存失败", "请检查填写项", "warning", false);
                });
        };
        /**
         * [close description] 关闭模态框
         * @return {[type]} [description] null 
         */
        $scope.close = function() {
            $modalInstance.dismiss();
        };
    }]);
