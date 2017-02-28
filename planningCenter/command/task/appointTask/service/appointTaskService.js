/*create by bai.zhiming 2016.7.01*/
"use strict";
angular.module("appointTaskServiceModule", [])
    .factory("appointTaskService", [function() {
        return {
            /**
             * [initDropDownList description:下拉框枚举值]
             * @return {[object]}      [description] null
             */
            initDropDownList: function() {
                return {
                    appointTypes: [{ name: "全部" }, { name: "线索", value: "1" }, { name: "任务", value: "2" }],
                    /*appointStatuses: [{ name: "全部" }, { name: "是", value: "1" }, { name: "否", value: "0" }],*/
                    appointStatuses: [{ name: "全部" }, { name: "普通", value: "0" }, { name: "重要", value: "2" }, { name: "紧急", value: "1" }, { name: "敏感", value: "3" }],
                    /*taskViewStatus: [{ name: "全部" }, { name: "是", value: "1" }, { name: "否", value: "0" }],*/
                    taskViewStatus: [{ name: "全部" }, { name: "普通", value: "0" }, { name: "重要", value: "2" }, { name: "紧急", value: "1" }, { name: "敏感", value: "3" }],
                    searchTypes: [{ name: "标题", value: "title" }, { name: "正文", value: "content" }],
                    isUrgentTypes:[{ name: "普通", value: "0" }, { name: "重要", value: "2" }, { name: "紧急", value: "1" }, { name: "敏感", value: "3" }]
                };
            },
            /**
             * [taskStatusMap description:任务状态Map]
             * @return {[object]}      [description] null
             */
            taskStatusMap: function() {
                return {
                    "3": "接受",
                    "5": "部分接受",
                    "6": "未接受",
                    "0": ""
                };
            },
            /**
             * [timeLineDataSwitch description:操作日志时间轴数据转换]
             * @param  {[array]} orgArrayData [description] 原始日志数据
             * @return {[type]}      [description] null
             */
            timeLineDataSwitch: function(orgArrayData,timeAttribute) {
                var completeData = [];
                angular.forEach(orgArrayData, function(data, index, array) {
                    var nowDate = new Date(Date.parse(array[index][timeAttribute])).getDate();
                    var preDate = index !== 0 ? new Date(Date.parse(array[index - 1][timeAttribute])).getDate() : "";
                    if (index === 0 || nowDate !== preDate) {
                        completeData.push({ day: new Date(Date.parse(data[timeAttribute])), times: [{ value: data }] });
                    } else if (nowDate === preDate) {
                        completeData[completeData.length - 1].times.push({ value: data });
                    }
                });
                return completeData;
            },
            taskOperMap: function() {
                return {
                    "10": "新增",
                    "11": "接受",
                    "1": "已读"
                };
            },
        };
    }]);
