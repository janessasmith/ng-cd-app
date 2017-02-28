"use strict";
//作者：bai.zhiming
//日期：2016-9-9
//描述：网站左侧导航相关方法
angular.module("websiteLeftServiceModule", [])
    .factory("websiteLeftService", ["$q", "trsHttpService", function($q, trsHttpService) {
        /**
         * [queryClassifyByChnl description]通过栏目ID查询有权限的子栏目
         * @param  {[string]} channelid [description]栏目ID
         * @param  {[string]} platform [description]所属平台
         * @return {[array]}  promise  [description] 子栏目集合
         */
        function queryClassifyByChnl(channelid, platform) {
            var deffer = $q.defer();
            var params = {
                serviceid: "mlf_mediasite",
                methodname: "queryClassifyByChnl",
                channelid: channelid,
                platform: platform
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                deffer.resolve(data.CHILDREN);
            });
            return deffer.promise;
        }
        /**
         * [positioningChannel description]通过栏目ID获得栏目的ID路径
         * @param  {[string]} channelid [description]栏目ID
         * @param  {[string]} platform [description]所属平台
         * @return {[string]}  promise  [description] id路径字符串
         */
        function positioningChannel(channelid, platform) {
            var deffer = $q.defer();
            var params = {
                CHANNELID: channelid,
                PLATFORM: platform,
                serviceid: "mlf_website",
                methodname: "positioningChannel"
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                deffer.resolve(data.replace(/"/g, "").split(","));
            });
            return deffer.promise;
        }

        function expandedAndSelectedChannel(index, idPathData, childrenArray, platform, expandedNode, callback) {
            for (var i = 0; i < childrenArray.length; i++) {
                var channelid = childrenArray[i].CHANNELID
                if (channelid === idPathData[index]) {
                    queryClassifyByChnl(channelid, platform).then(function(data) {
                        childrenArray[i].CHILDREN = data;
                        expandedNode.push(childrenArray[i]);
                        index++;
                        if (index !== idPathData.length) {
                            expandedAndSelectedChannel(index, idPathData, data, platform, expandedNode, callback);
                        } else {
                            callback(childrenArray[i]);
                        }
                    });
                    break
                }
            }
        }
        return {
            /**
             * [positionSelectChannel description]通过栏目ID定位并选中栏目
             * @param  {[obj]} treeData [description]l栏目树数据
             * @param  {[string]} channelid [description]栏目ID
             * @param  {[string]} platform [description]所属平台
             * @return {[null]}  promise  [description] 子栏目集合
             */
            positionSelectChannel: function(treeData, channelid, platform, expandedNode) {
            	var deffer = $q.defer();
                positioningChannel(channelid, platform).then(function(IdPathData) {
                    for (var i = 0; i < treeData.length; i++) {
                        var firstChannelid = treeData[i].CHANNELID;
                        if (firstChannelid === IdPathData[0]) {
                            queryClassifyByChnl(firstChannelid, platform).then(function(data) {
                                treeData[i].CHILDREN = data;
                                expandedNode.push(treeData[i]);
                                var index = 1;
                                expandedAndSelectedChannel(index, IdPathData, data, platform, expandedNode, function(selectedChannel) {
                                	deffer.resolve(selectedChannel);
                                });
                            });
                            break;
                        }
                    }
                });
                return deffer.promise;
            }
        };
    }]);
