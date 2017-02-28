//作者：bai.zhiming
//描述：地图的搜索建议框
//时间：2016/10/10
'use strict';
angular.module("mapSuggestionForReportModule", [])
    .directive("mapSuggestionForReport", ["$timeout", function($timeout) {
        return {
            restrict: 'AE',
            scope: {
                map: "=",
                addressName: "=",
                addressValue: "=",
                myfocus: "&",
                myblur: "&",
                index: "@"
                    /*replace: true,
                    transclude:true,*/
            },
            templateUrl: './planningCenter/command/service/modal/createReport/directive/mapSuggestionForReport_tpl.html',
            link: function(scope, iElement, iAttrs) {
                // 百度地图API功能
                var myValue;

                function G(id) {
                    return document.getElementById(id);
                }
                $timeout(function() {
                    var ac = new BMap.Autocomplete( //建立一个自动完成的对象
                        {
                            "input": "suggestId_" + scope.index,
                            "location": scope.map.ue
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

                    ac.addEventListener("onconfirm", function(e) { //鼠标点击下拉列表后的事件
                        var _value = e.item.value;
                        myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                        G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
                        deletePoint(); //定位前先清除原有的
                        setPlace();
                    });
                }, 100);
                $timeout(function() {
                    $("#suggestId_" + scope.index).val(scope.addressName);
                }, 500);

                function deletePoint() {
                    var allOverlay = scope.map.getOverlays();
                    for (var k = 0; k < allOverlay.length; k++) {
                        if (allOverlay[k].myIndex === scope.index) {
                            scope.map.removeOverlay(allOverlay[k]);
                        }
                    }
                }

                function setPlace() {
                    //scope.map.clearOverlays(); 清除地图上所有覆盖物
                    function myFun() {
                        var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
                        scope.map.centerAndZoom(pp, 10);
                        //var myIcon = new BMap.Icon(scope.type === 'task' ? "./planningCenter/command/task/appointTask/images/rw.png" : "./planningCenter/command/task/appointTask/images/xs.png", new BMap.Size(30, 30));
                        var myIcon = new BMap.Icon("./planningCenter/command/task/appointTask/images/rw.png", new BMap.Size(30, 30));
                        var marker = new BMap.Marker(pp, { icon: myIcon });
                        scope.map.addOverlay(marker); //添加标注
                        marker.myIndex = scope.index;
                        /*var label = new BMap.Label(parseInt(scope.index) + 1, { offset: new BMap.Size(3, 0) });
                        marker.setLabel(label);*/
                        scope.addressValue = pp;
                    }
                    var local = new BMap.LocalSearch(scope.map, { //智能搜索
                        onSearchComplete: myFun
                    });
                    scope.addressName = myValue;
                    local.search(myValue);
                }
                scope.relocation = function(index) {
                    $timeout(function() {
                        var suggestionHtml = $("body").find(".tangram-suggestion-main")[index].innerHTML;
                        $(".mySuggestion_" + index).html(suggestionHtml);
                    }, 100);
                };
                scope.theFocus = function() {
                    scope.myfocus();
                };
                scope.hiddenSuggestion = function(index) {
                    $(".mySuggestion_" + index).html("");
                    scope.myblur();
                };
                scope.setZindex = function(index) {
                    var zindex;
                    zindex = 900 - parseInt(index);
                    return {
                        "z-index": zindex
                    };
                };
                scope.suggestionStyle = function() {
                    var zindex;
                    zindex = 9999;
                    return {
                        "z-index": zindex,
                        "position": "absolute",
                        "left": "105px",
                        "top": "35px"
                    };
                };
            }
        };
    }]);
