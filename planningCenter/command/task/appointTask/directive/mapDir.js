/*create by bai.zhiming 2016.6.30*/
"use strict";
angular.module("trsBaiduMap", [])
    .directive("mapSuggestion", ["$timeout", function($timeout) {
        return {
            restrict: 'AE',
            scope: {
                map: "=",
                addressName: "=",
                addressValue: "=",
                callback: "&",
                type: "=",
                required: "="
            },
            templateUrl: './planningCenter/command/task/appointTask/directive/mapSuggestion_tpl.html',
            link: function(scope, iElement, iAttrs) {
                // 百度地图API功能
                function G(id) {
                    return document.getElementById(id);
                }

                var ac = new BMap.Autocomplete( //建立一个自动完成的对象
                    {
                        "input": "suggestId",
                        "location": map
                    });

                ac.addEventListener("onhighlight", function(e) { //鼠标放在下拉列表上的事件
                    var str = "";
                    var _value = e.fromitem.value;
                    var value = "";
                    if (e.fromitem.index > -1) {
                        value = _value.province + _value.city + _value.district + _value.street + _value.business;
                    }
                    str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

                    value = "";
                    if (e.toitem.index > -1) {
                        _value = e.toitem.value;
                        value = _value.province + _value.city + _value.district + _value.street + _value.business;
                    }
                    str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
                    G("searchResultPanel").innerHTML = str;
                });

                var myValue;
                ac.addEventListener("onconfirm", function(e) { //鼠标点击下拉列表后的事件
                    var _value = e.item.value;
                    myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                    G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

                    setPlace();
                });

                function setPlace() {
                    scope.map.clearOverlays(); //清除地图上所有覆盖物
                    function myFun() {
                        var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
                        scope.map.centerAndZoom(pp, 18);
                        var myIcon = new BMap.Icon(scope.type === 'task' ? "./planningCenter/command/task/appointTask/images/rw.png" : "./planningCenter/command/task/appointTask/images/xs.png", new BMap.Size(30, 30));
                        scope.map.addOverlay(new BMap.Marker(pp, { icon: myIcon })); //添加标注
                        scope.addressValue = pp;
                    }
                    var local = new BMap.LocalSearch(scope.map, { //智能搜索
                        onSearchComplete: myFun
                    });
                    scope.addressName = myValue;
                    scope.callback();
                    local.search(myValue);
                }
                $timeout(function() { //解决地址覆盖问题
                    $("#suggestId").val(scope.addressName);
                }, 1000);
                scope.$watch("addressName", function(newV, oldV) {
                     $("#suggestId").val(scope.addressName);
                });
            }
        };
    }]);
