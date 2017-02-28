"use strict";
(function() {
    var wordCloudStatus;
    var wordCloudVisual = {};
    window.wordCloudVisual = wordCloudVisual;
    //获取接口数据
    var myUrl = window.location.href;
    var toEventid = myUrl.substring(myUrl.indexOf("eventId"));
    var toModelid = toEventid.substring(toEventid.indexOf("methodname"));
    var toMediaType = toModelid.substring(toModelid.indexOf("mediatype"));
    var evetnid = toEventid.substring(8,toEventid.indexOf("&"));
    var modelid = toModelid.substring(11,toModelid.indexOf("&"));
    var mediatype = decodeURIComponent(toMediaType.substring(10));
    wordCloudVisual.initData = function(callback) {
        var parameters = {
            typeid: "event",
            eventid: parseInt(evetnid),
            serviceid: "eventtrace",
            modelid: modelid,
            mediatype: mediatype
        };
        $.ajax({
            url: "/wcm/bigdata.do",
            data: parameters,
            dataType: "text",
            success: function(data) {
                callback(data);
            },
            error: function() {}
        });
    };
    //数据转换
    wordCloudVisual.switchData = function(data) {
    	data = JSON.parse(data);
        for (var i = 0; i < data.length; i++) {
            data[i].name = data[i].STRVALUE;
            delete data[i].STRVALUE;
            data[i].value = parseInt(data[i].IRECORDNUM);
            delete data[i].IRECORDNUM;
            if (i === 0) {
                data[i].itemStyle = {
                    normal: {
                        color: 'black'
                    }
                };
            }else{
            	data[i].itemStyle = createRandomItemStyle();
            }
        }
        return data;
    };
    //获取随机颜色
    function createRandomItemStyle() {
        return {
            normal: {
                color: 'rgb(' + [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                ].join(',') + ')'
            }
        };
    }
})();
