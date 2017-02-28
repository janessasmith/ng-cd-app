'use strict';
/**
 *  Module  Iwo 新闻详情页
 *
 * Description
 */
angular.module('iWoPreviewModule', []).controller('iWoPreviewCtrl', ['$scope', '$stateParams', '$modal', '$q', '$sce', '$window', '$state', 'trsHttpService', 'editcenterRightsService', 'myManuscriptService', 'trsconfirm', 'initVersionService', 'editingCenterService', 'iWoService', 'storageListenerService', 'trsPrintService',
    function($scope, $stateParams, $modal, $q, $sce, $window, $state, trsHttpService, editcenterRightsService, myManuscriptService, trsconfirm, initVersionService, editingCenterService, iWoService, storageListenerService, trsPrintService) {
        initStatus();
        initData();
        //初始化状态
        function initStatus() {
            $scope.params = {
                "serviceid": $state.params.departmentid ? "nb_departmentRelease" : "mlf_myrelease",
                "methodname": "",
                "MetaDataId": $stateParams.metadataid,
                "DepartmentId": $state.params.departmentid //部门稿库需要传入部门ID
            };
            $scope.status = {
                btnRights: {},
                preview: {
                    1: "iWoNewsPreview",
                    2: "iWoAtlasPreview"
                },
                methodname: {
                    1: "getNewsDoc",
                    2: "getPicsDoc"
                },
                departmentMethod: { //部门稿库查询
                    1: "getDepartmentDoc",
                    2: "getPicsDoc"
                },
                editType: {
                    1: "iwonews",
                    2: "iwoatlas",
                    "iwo.personal": 0,
                    "iwo.received": 1
                },
                docType: $stateParams.type,
                bitFaceTit: "查看痕迹",
                initBtn: true,
                chnldocid: $stateParams.chnldocid,
                isCollectDraft: angular.isDefined($stateParams.doccollectrelid),
                isUnit: $state.params.isdepartment == "false" ? true : false,
            };
            $scope.data = {
                item: "",
                copyDarft: "",
                METADATAID: $stateParams.metadataid
            };
        }
        /**
         * [initData description]初始化数据,$statparam.type区分稿件类型,1是新闻稿,2是图集稿
         * @return {[type]} [description]
         */
        function initData() {
            storageListenerService.removeListener("iwo");
            $scope.params.methodname = $state.params.departmentid ? $scope.status.departmentMethod[$stateParams.type] : $scope.status.methodname[$stateParams.type];
            if (angular.isDefined($stateParams.doccollectrelid)) {
                $scope.params.methodname = "queryCollectDoc";
                $scope.params.CollectId = $stateParams.doccollectrelid;
            } else {
                copyNewsDarft();
            }
            requestData();
            editcenterRightsService.initIwoListBtn($stateParams.modalname).then(function(data) {
                $scope.status.btnRights = data;
            });
            //获取查看痕迹按钮权限
            editcenterRightsService.initIwoListBtn("iwo.trace").then(function(data) {
                $scope.status.bigFaceRigths = data;
            });
        }
        //查询复制稿件
        function copyNewsDarft() {
            var copyParams = {
                serviceid: "mlf_releasesource",
                methodname: "queryCopyAndBuildDocs",
                MetaDataId: $stateParams.metadataid
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), copyParams, "get").then(function(data) {
                $scope.data.copyDarft = data;
            });
        }

        function requestData() {
            var defered = $q.defer();
            LazyLoad.css('./components/util/ueditor/service/css/ueditorBuiltInStyles.css?v=2.0', function(arg) {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                    $scope.data.item = data;
                    $scope.data.item.ABSTRACT = angular.isDefined($scope.data.item.ABSTRACT) ? $scope.data.item.ABSTRACT.replace(/\n/g, "<br/>") : "";
                    // $scope.data.item.METADATAID = parseInt($stateParams.metadataid);
                    $scope.data.item.CONTENT = $sce.trustAsHtml($scope.data.item.CONTENT);
                    $scope.data.htmlContent = $sce.trustAsHtml(data.HTMLCONTENT);
                    document.title = data.TITLE;
                    $scope.data.selectedArray = [{
                        'TITLE': $scope.data.item.TITLE,
                        'CHNLDOCID': $stateParams.chnldocid,
                        'METADATAID': $stateParams.metadataid
                    }];
                });
            });
            return defered.promise;
        }
        /**
         * [edit description]跳转到编辑
         * @return {[type]} [description]null
         */
        $scope.edit = function() {
            $state.go($scope.status.editType[$stateParams.type], {
                "chnldocid": $stateParams.chnldocid,
                "metadataid": $stateParams.metadataid,
                "status": $scope.status.editType[$stateParams.modalname],
                "departmentid": $state.params.departmentid
            }, {
                reload: true
            });
        };

        //创作轴
        $scope.creationAxis = function() {
            /*var params = {
                serviceid: "mlf_releasesource",
                methodname: "setCreation",
                metadataid: $stateParams.metadataid
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType("加入创作轴成功", "", "success", false);
            });*/
            if ($scope.data.item.MLFTYPE !== "1") {
                addToCreationFromWCM($stateParams.metadataid);
            } else {
                addToCreationFromBD($stateParams.metadataid, $scope.data.item.CHANNELNAME, $scope.data.item.INDEXNAME);
            }
        };
        /**
         * [addToCreationFromWCM description] 从WCM加入到创作轴
         * @param {[type]} imgname    [description] 图片路径
         * @param {[type]} imgauthor  [description] 图片作者
         * @param {[type]} content    [description] 正文
         */
        function addToCreationFromWCM(metadataid) {
            var params = {
                serviceid: "mlf_releasesource",
                methodname: "setCreation",
                metadataid: metadataid,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType("该稿件已成功添加到创作轴", "", "success", false);
                $window.document.getSelection().collapse($window.document, 1);
                //console.log("加入WCM创作轴成功");
            });
        }
        /**
         * [addToCreationFromBD description]从大数据加入到创作轴
         * @param {[type]} imgname [description]图片路径
         * @param {[type]} content [description]正文
         */
        function addToCreationFromBD(guid, channelName, indexName) {
            var params = {
                typeid: "zyzx",
                serviceid: "mlf_bigdataexchange",
                methodname: "batchcreation",
                guid: guid,
                channelName: channelName,
                indexname: indexName
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType("该稿件已成功添加到创作轴", "", "success", false);
                $window.document.getSelection().collapse($window.document, 1);
                //console.log("加入BD创作轴成功");
            });
        }
        //按钮操作开
        //关闭操作
        $scope.close = function() {
            var opened = $window.open('about:blank', '_self');
            opened.close();
        };
        /**
         * [showVersionTime description:流程版本时间与操作日志]
         */
        $scope.showVersionTime = function() {
            editingCenterService.getVersionTimeWithCopyDraft($scope.data, true);
        };
        /**
         * [printBtn description：打印]
         */
        $scope.printBtn = function() {
            requestPrintVersion($stateParams.metadataid).then(function(data) {
                requestPrintData(data);
            });
        };
        /**
         * [requestPrintVersion description：打印请求流程]
         */
        function requestPrintVersion(item) {
            var deferred = $q.defer();
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), {
                serviceid: "mlf_metadatalog",
                methodname: "query",
                MetaDataId: item
            }, 'get').then(function(data) {
                deferred.resolve(data.DATA);
            });
            return deferred.promise;
        }
        /**
         * [requestPrintVersion description：打印请求详情]
         */
        function requestPrintData(version) {
            var params = {
                "serviceid": "mlf_myrelease",
                "methodname": $scope.status.methodname[$stateParams.type],
                "MetaDataId": $stateParams.metadataid
            };
            $scope.data.printResult = [];
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                var result = data;
                data.VERSION = version;
                data.HANGCOUNT = Math.ceil(data.DOCWORDSCOUNT / 27);
                $scope.data.printResult.push(result);
                trsPrintService.trsIwoPrintDocument($scope.data.printResult);
            });
        }

    }
]);
