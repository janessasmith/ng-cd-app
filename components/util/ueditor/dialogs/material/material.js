"use strict";
/**
 * 素材库选择素材
 * Created by cc 17-02-16
 */
angular.module('materialApp', ['ui.bootstrap'])
.controller('ueditorMaterialImg', ["$scope", "$http", "$q", "$timeout", function($scope, $http, $q, $timeout) {
    initStatus();
    initData();
    /**
     * [initStatus description]初始化状态
     * @return {[type]} [description]
     */
    function initStatus() {
        $scope.page = {
            'CURRPAGE': 1,
            'PAGESIZE': 10,
        };
        $scope.params = {
            'serviceid': 'nb_material',
            'methodname': 'query',
            'TypeId': 5,
            'CURRPAGE': $scope.page.CURRPAGE,
            'PAGESIZE': $scope.page.PAGESIZE,
        }; //查询素材列表参数
        $scope.classifyParams = {
            serviceid: "nb_material",
            methodname: "queryType",
            materialType: 1, //图片的素材类型
            parentId: 0 //一级分类
        }; //查询素材分类参数
        $scope.data = {
            selectedArray: [], //被选中的素材集合
            pics: [], //素材集合
        };
        $scope.status = {
            selectedMaterial: "", //被选中的素材
            imgWidth: '',
            imgHeight: ''
        };
    }
    /**
     * [initData description]初始化数据
     * @return {[type]} [description]
     */
    function initData() {
        queryFirClassify().then(function() {
            requetData($scope.data.selectedFirClassify.value);
            querySecClassify($scope.data.selectedFirClassify.value).then(function(data) {
                queryThirdClassify(data.value);
            });
        });
    }
    /**
     * [conversionDropDown description]将分类转换为下拉框可用的数据
     * @param  {[array]} items  [description]分类信息
     * @return {[array]}        [description]转换后的分类信息
     */
    function conversionDropDown(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].name = items[i].TITLE;
            items[i].value = items[i].MATERIALTYPEID;
        }
        return items;
    }
    /**
     * [queryFirClassify description]查询素材库的一级分类
     * @return {[type]} [description]
     */
    function queryFirClassify() {
        var deffer = $q.defer();
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.classifyParams
        }).success(function(data, status, headers, config) {
            if (!data) return;
            $scope.data.firstClassify = conversionDropDown(data);
            $scope.data.selectedFirClassify = angular.copy($scope.data.firstClassify)[0];
            $scope.status.selectedMaterial = data[0]; //被选中的素材
            deffer.resolve(data);
        });
        return deffer.promise;
    }
    /**
     * [queryChildClassify description]查询二级分类
     * @param  {[num]} parentId        [description]父分类ID
     * @return {[type]}                [description]
     */
    function querySecClassify(parentId) {
        $scope.classifyParams.parentId = parentId;
        var deffer = $q.defer();
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.classifyParams
        }).success(function(data, status, headers, config) {
            if (!data) return;
            $scope.data.secClassify = conversionDropDown(data);
            $scope.data.selectedSecClassify = angular.copy($scope.data.secClassify)[0];
            deffer.resolve($scope.data.selectedSecClassify);
        });
        return deffer.promise;
    }
    /**
     * [queryThirdClassify description]查询三级分类
     * @param  {[num]} parentId  [description]父分类ID
     * @return {[type]}          [description]
     */
    function queryThirdClassify(parentId) {
        $scope.classifyParams.parentId = parentId;
        var deffer = $q.defer();
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.classifyParams
        }).success(function(data, status, headers, config) {
            if (!data) return;
            $timeout(function() {
                $scope.data.thirdClassify = conversionDropDown(data);
                $scope.data.selectedthirdClassify = angular.copy($scope.data.thirdClassify)[0];
            });
            deffer.resolve(data);
        });
        return deffer.promise;
    }
    /**
     * [requetData description]数据请求
     * @param  {[num]} MaterialTypeId  [description]分类ID
     * @return {[type]}                [description]
     */
    function requetData(MaterialTypeId) {
        $scope.params.MaterialTypeId = MaterialTypeId;
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.params
        }).success(function(data, status, headers, config) {
            if (!data) return;
            !!data.PAGER ? $scope.page = data.PAGER : $scope.page.PAGECOUNT = '0';
            $scope.data.pics = data.DATA;
        });
    }
    /**
     * [selectMaterial description]选择素材
     * @param  {[obj]} material  [description]素材信息
     * @return {[type]}          [description]
     */
    $scope.selectMaterial = function(material) {
        if ($scope.data.selectedArray.indexOf(material) < 0) {
            $scope.data.selectedArray.push(material);
        } else {
            $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(material), 1);
        }
    };
    /**
     * [queryByDropdown description]一级分类下拉框选择
     * @param  {[obj]} classify  [description]选中的一级分类
     * @return {[type]}          [description]
     */
    $scope.firstDropdown = function(classify) {
        dropDown(classify);
        querySecClassify(classify.value).then(function(data) {
            queryThirdClassify(data.value);
        });
    };
    /**
     * [secDropdown description]二级分类下拉框选择
     * @param  {[obj]} classify  [description]选中的二级分类
     * @return {[type]}          [description]
     */
    $scope.secDropdown = function(classify) {
        dropDown(classify);
        queryThirdClassify(classify.value);
    };
    /**
     * [thridDropDown description]三级分类下拉框选择
     * @param  {[obj]} classify  [description]选中的三级分类
     * @return {[type]}          [description]
     */
    $scope.thridDropDown = function(classify) {
        dropDown(classify);
    };
    /**
     * [dropDown description]点击下拉框时操作
     * @param  {[obj]} classify  [description]选中的分类
     * @return {[type]}          [description]
     */
    function dropDown(classify) {
        $scope.params.CURRPAGE = 1;
        $scope.status.selectedMaterial = classify;
        requetData(classify.value);
    }
    /**
     * [pageChanged description]分页点击
     * @return {[type]} [description]
     */
    $scope.pageChanged = function() {
        $scope.params.CURRPAGE = $scope.page.CURRPAGE;
        requetData($scope.status.selectedMaterial.MATERIALTYPEID);
    };
    /**
     * [onok description]点击确定的回调
     * @return {[type]} [description]
     */
    dialog.onok = function() {
        var data = $scope.data.selectedArray;
        editor.execCommand('dialog_material_img', data, $scope.status.imgWidth, $scope.status.imgHeight);
    };
}]).controller('ueditorMaterial', ["$scope", "$http", "$q", "$timeout", function($scope, $http, $q, $timeout) {
    initStatus();
    initData();
    /**
     * [initStatus description]初始化状态
     * @return {[type]} [description]
     */
    function initStatus() {
        $scope.page = {
            'CURRPAGE': 1,
            'PAGESIZE': 10,
        };
        $scope.params = {
            'serviceid': 'nb_materialrelease',
            'methodname': 'queryAllVideoFromMas',
            'CURRPAGE': $scope.page.CURRPAGE,
            'PAGESIZE': $scope.page.PAGESIZE,
        }; //查询素材列表参数
        $scope.classifyParams = {
            serviceid: "nb_material",
            methodname: "queryType",
            materialType: 2, //音视频的素材类型
            parentId: 0 //一级分类
        }; //查询素材分类参数
        $scope.data = {
            selectedArray: [], //被选中的素材集合
            videos: [], //素材集合
        };
        $scope.status = {
            selectedMaterial: "", //被选中的素材
            materialWidth:"",//素材的宽度
            materialHeight:"",//素材的高度
        };
    }
    /**
     * [initData description]初始化数据
     * @return {[type]} [description]
     */
    function initData() {
        queryFirClassify().then(function() {
            requetData($scope.data.selectedFirClassify.value);
            querySecClassify($scope.data.selectedFirClassify.value).then(function(data) {
                queryThirdClassify(data.value);
            });
        });
    }
    /**
     * [conversionDropDown description]将分类转换为下拉框可用的数据
     * @param  {[array]} items  [description]分类信息
     * @return {[array]}        [description]转换后的分类信息
     */
    function conversionDropDown(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].name = items[i].TITLE;
            items[i].value = items[i].MATERIALTYPEID;
        }
        return items;
    }
    /**
     * [queryFirClassify description]查询素材库的一级分类
     * @return {[type]} [description]
     */
    function queryFirClassify() {
        var deffer = $q.defer();
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.classifyParams
        }).success(function(data, status, headers, config) {
            if (!data) return;
            $scope.data.firstClassify = conversionDropDown(data);
            $scope.data.selectedFirClassify = angular.copy($scope.data.firstClassify)[0];
            $scope.status.selectedMaterial = data[0]; //被选中的素材
            deffer.resolve(data);
        });
        return deffer.promise;
    }
    /**
     * [queryChildClassify description]查询二级分类
     * @param  {[num]} parentId        [description]父分类ID
     * @return {[type]}                [description]
     */
    function querySecClassify(parentId) {
        $scope.classifyParams.parentId = parentId;
        var deffer = $q.defer();
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.classifyParams
        }).success(function(data, status, headers, config) {
            if (!data) return;
            $scope.data.secClassify = conversionDropDown(data);
            $scope.data.selectedSecClassify = angular.copy($scope.data.secClassify)[0];
            deffer.resolve($scope.data.selectedSecClassify);
        });
        return deffer.promise;
    }
    /**
     * [queryThirdClassify description]查询三级分类
     * @param  {[num]} parentId  [description]父分类ID
     * @return {[type]}          [description]
     */
    function queryThirdClassify(parentId) {
        $scope.classifyParams.parentId = parentId;
        var deffer = $q.defer();
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.classifyParams
        }).success(function(data, status, headers, config) {
            if (!data) return;
            $timeout(function() {
                $scope.data.thirdClassify = conversionDropDown(data);
                $scope.data.selectedthirdClassify = angular.copy($scope.data.thirdClassify)[0];
            });
            deffer.resolve(data);
        });
        return deffer.promise;
    }
    /**
     * [requetData description]数据请求
     * @param  {[num]} MaterialTypeId  [description]分类ID
     * @return {[type]}                [description]
     */
    function requetData(MaterialTypeId) {
        $scope.params.MaterialTypeId = MaterialTypeId;
        $http({
            method: "GET",
            url: "/wcm/mlfcenter.do",
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: $scope.params
        }).success(function(data, status, headers, config) {
            if (!data) return;
            !!data.PAGER ? $scope.page = data.PAGER : $scope.page.PAGECOUNT = '0';
            $scope.data.videos = data.DATA;
        });
    }
    /**
     * [selectMaterial description]选择素材
     * @param  {[obj]} material  [description]素材信息
     * @return {[type]}          [description]
     */
    $scope.selectMaterial = function(material) {
        if ($scope.data.selectedArray.indexOf(material) < 0) {
            $scope.data.selectedArray.push(material);
        } else {
            $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(material), 1);
        }
    };
    /**
     * [queryByDropdown description]一级分类下拉框选择
     * @param  {[obj]} classify  [description]选中的一级分类
     * @return {[type]}          [description]
     */
    $scope.firstDropdown = function(classify) {
        dropDown(classify);
        querySecClassify(classify.value).then(function(data) {
            queryThirdClassify(data.value);
        });
    };
    /**
     * [secDropdown description]二级分类下拉框选择
     * @param  {[obj]} classify  [description]选中的二级分类
     * @return {[type]}          [description]
     */
    $scope.secDropdown = function(classify) {
        dropDown(classify);
        queryThirdClassify(classify.value);
    };
    /**
     * [thridDropDown description]三级分类下拉框选择
     * @param  {[obj]} classify  [description]选中的三级分类
     * @return {[type]}          [description]
     */
    $scope.thridDropDown = function(classify) {
        dropDown(classify);
    };
    /**
     * [dropDown description]点击下拉框时操作
     * @param  {[obj]} classify  [description]选中的分类
     * @return {[type]}          [description]
     */
    function dropDown(classify) {
        $scope.params.CURRPAGE = 1;
        $scope.status.selectedMaterial = classify;
        requetData(classify.value);
    }
    /**
     * [pageChanged description]分页点击
     * @return {[type]} [description]
     */
    $scope.pageChanged = function() {
        $scope.params.CURRPAGE = $scope.page.CURRPAGE;
        requetData($scope.status.selectedMaterial.MATERIALTYPEID);
    };
    /**
     * [onok description]点击确定的回调
     * @return {[type]} [description]
     */
    dialog.onok = function() {
        editor.execCommand('dialog_material', $scope.data.selectedArray,$scope.status.materialWidth, $scope.status.materialHeight);
    };
}]).directive('trsSingleSelect', ['$timeout', function($timeout) {
    return {
        scope: {
            callback: "&",
            options: "=",
            selectedOption: "=",
            namekey: "@",
            valuekey: "@",
            label: "@"
        },
        restrict: 'E',
        templateUrl: '../../../trsDropDownList/trsSingleSelection.html',
        link: function(scope, iElm, iAttrs, controller) {
            scope.setSelected = function(option) {
                scope.label = null;
                scope.selectedOption = option;
                $timeout(function() {
                    scope.callback();
                });
            };
        }
    };
}]).filter("trsLimitTo", [function() {
    return function(input, param) {
        if (angular.isDefined(input)) {
            if (input && (input.length > param)) {
                input = input.substring(0, param) + '...';
            }
            return input;
        }
    };
}]);
