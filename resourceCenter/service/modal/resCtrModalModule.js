"use strict";
angular.module("resCtrModalModule", ["takeDraftModule", "reserveModalModule", 'resourceExportModule', 'resourceInfoModule', 'weichatModule', 'createGroupModule', 'showGroupModule', 'printModalModule', 'digitalModule', 'showPGroupModule']).factory("resCtrModalService", function($modal) {
    return {
        // 预留
        reserveDraft: function(items) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/reserveModal/reserveModal.html",
                windowClass: "resource-reserve-modal",
                backdrop: false,
                controller: "reserveModalCtrl",
                resolve: {
                    items: function() {
                        return items;
                    }
                }
            });
            return modalInstance;
        },
        exportModal: function() {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/exportModal/exportModal.html",
                size: 'sm',
                windowClass: 'exportModal',
                backdrop: false,
                controller: "exportModalCtrl"
            });
            return modalInstance;
        },
        infoModal: function(docId, isShowRepeat) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/infoModal/infoModal.html",
                size: 'lg',
                windowClass: 'infoModal',
                backdrop: false,
                controller: "infoModalCtrl",
                resolve: {
                    params: function() {
                        return {
                            'isShowRepeat': isShowRepeat,
                            'docId': docId
                        };
                    }
                }
            });
            return modalInstance;
        },
        /**
         * { materialInfoModal_description }素材“取”信息弹窗
         * @param      {<type>}  docId   素材ID
         * @return     {<type>}  { description_of_the_return_value }
         */
        materialInfoModal: function(docId) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/infoModal/infoModal.html",
                size: 'lg',
                windowClass: 'infoModal',
                backdrop: false,
                controller: "materialInfoModalCtrl",
                resolve: {
                    params: function() {
                        return {
                            'docId': docId
                        };
                    }
                }
            });
            return modalInstance;
        },
        bigDataInfoModal: function(guid, isShowRepeat) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/infoModal/infoModal.html",
                size: 'lg',
                windowClass: 'infoModal',
                backdrop: false,
                controller: "bigDataInfoModalCtrl",
                resolve: {
                    options: function() {
                        return {
                            'guid': guid,
                            'isShowRepeat': isShowRepeat
                        };
                    }
                }
            });
            return modalInstance;
        },
        weiChatModal: function(item) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/weichatModal/weiChatModal.html",
                size: 'lg',
                windowClass: 'infoModal',
                backdrop: false,
                controller: "weichatCtrl",
                resolve: {
                    selectedSource: function() {
                        return item;
                    }
                }
            });
            return modalInstance;
        },
        createGroup: function(temp) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/createModal/createmodal.html",
                windowClass: "subscribe_modal mt120",
                backdrop: temp || false,
                controller: "createGroupCtrl",
                resolve: {
                    hasCloseAlert: function() {
                        return temp;
                    }
                }
            });
            return modalInstance;
        },
        showGroup: function(editValues) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/groupModal/groupmodal.html",
                windowClass: "resource-take-draft",
                backdrop: false,
                controller: "showGroupCtrl",
                resolve: {
                    editValues: function() {
                        return editValues;
                    }
                }
            });
            return modalInstance;
        },
        /**
         * [fullTakeDraft description]取稿
         * @param  {[obj]}  params      [description]取稿所需的参数
         * @param  {Boolean} isOnlyOne  [description]是否只有一篇稿件
         * @param  {Boolean} isNewMedia [description]是否为新媒体渠道(app、网站、微信)
         * @return {[type]}             [description]
         */
        fullTakeDraft: function(params, isOnlyOne, isNewMedia) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/takeDraftModal/takeDraft_tpl.html",
                windowClass: "resource-take-draft",
                backdrop: false,
                resolve: {
                    basicParams: function() {
                        return params;
                    },
                    isOnlyOne: function() {
                        return isOnlyOne;
                    },
                    isNewMedia: function() {
                        return isNewMedia;
                    }
                },
                controller: "fullTakeDraftCtrl"
            });
            return modalInstance;
        },
        printModal: function(params) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/printModal/printModal.html",
                windowClass: "resource_printModal",
                backdrop: false,
                resolve: {
                    params: function() {
                        return params;
                    }
                },
                controller: "printModalCtrl"
            });
            return modalInstance;
        },
        /** [digitalModal 数字报 选择报刊] */
        digitalModal: function(item) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/weichatModal/weiChatModal.html",
                size: 'lg',
                windowClass: 'infoModal',
                backdrop: false,
                controller: "digitalCtrl",
                resolve: {
                    selectedSource: function() {
                        return item;
                    }
                }
            });
            return modalInstance;
        },
        subscribeModal: function(items) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/service/modal/groupModal/parentgroupmodal.html",
                windowClass: 'resource-take-draft',
                backdrop: false,
                controller: "showPGroupCtrl",
                resolve: {
                    selectedSource: function() {
                        return items;
                    }
                }
            });
            return modalInstance;
        }
    };
});
