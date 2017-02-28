"use strict";
angular.module("broadcastServiceModule", [])
    .factory("broadcastService", [function() {
        return {
            /**
             * [initDropDownList description:下拉框枚举值]
             * @return {[object]}      [description] null
             */
            initDropDownList: function() {
                return {
                    broadcastTypes: [{ name: "全部" }, { name: "线索", value: "1" }, { name: "任务", value: "2" }],
                    broadcastStatuses: [{ name: "全部" }, { name: "是", value: "1" }, { name: "否", value: "0" }],
                    searchTypes: [{ name: "标题", value: "title" }, { name: "正文", value: "content" }]
                };
            }
        };
    }]);
