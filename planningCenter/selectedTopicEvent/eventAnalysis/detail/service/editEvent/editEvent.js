/*
    Create by fanglijuan 2016-04-22
*/
'use strict';
angular.module("editEventModule", [])
    .controller("editEventCtrl", ["$scope", "$q", '$timeout', '$compile', "$filter", "$modalInstance", "trsHttpService", "$validation", "planEventDetailService", "trsconfirm", "data",
        function($scope, $q, $timeout, $compile, $filter, $modalInstance, trsHttpService, $validation, planEventDetailService, trsconfirm, data) {
            initStatus();
            initData();

            function initStatus() {
                $scope.status = {};
            }
            /**
             * [initData description]初始化数据
             */
            function initData() {
                $scope.data = data;
                $scope.data.modalTitle = "事件简介";
                var date = new Date();
                $scope.data.MAXRATETIME = $scope.data.MAXRATETIME.replace(/月/g, "/").replace(/日/g, "");;
                $scope.data.MAXRATETIME = new Date(Date.parse($scope.data.MAXRATETIME));
                initMap();
            }


            //保存编辑
            $scope.confirm = function() {
                $validation.validate($scope.editEventSubmitForm).success(function(data) {
                    clearSuggestionDiv();
                    $scope.status.map.clearOverlays(); //先清除所有覆盖物
                    var finishData = angular.copy($scope.data);
                    finishData.MAXRATETIME = $filter("date")(finishData.MAXRATETIME, "MM月dd日").toString();
                    finishData.PLACE = JSON.stringify(finishData.PLACE);
                    $modalInstance.close({ type: "confirm", data: finishData });
                });
            };

            //取消
            $scope.cancel = function() {
                clearSuggestionDiv();
                $scope.status.map.clearOverlays(); //先清除所有覆盖物
                $modalInstance.close({ type: "cancel" });
            };
            //添加地点
            $scope.addPlace = function() {
                $validation.validate($scope.editEventSubmitForm["address" + ($scope.data.PLACE.length - 1)]).success(function() {
                    $scope.data.PLACE.push({ name: "", value: "", searchName: "" });
                });
            };

            function initMap() {
                window.BMap_loadScriptTime = (new Date()).getTime();
                LazyLoad.js(["http://api.map.baidu.com/getscript?v=2.0&ak=rZkn12K1F24d0vsTopn6s2NGcQ5HurgK&services=&t=20160627141851"], function() {
                    // 百度地图API功能
                    $scope.status.map = new BMap.Map("allMap", { minZoom: 5, maxZoom: 18 }); // 创建Map实例
                    $scope.status.map.centerAndZoom(new BMap.Point(120.219375, 30.259244), 5); // 初始化地图,设置中心点坐标和地图级别
                    $scope.status.map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
                    $scope.status.map.setCurrentCity("杭州"); // 设置地图显示的城市 此项是必须设置的
                    $scope.status.map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
                    initMarker();
                    var suggestionHtml = '<div class="item" ng-repeat="item in data.PLACE">' +
                        '<div class="invalidate-input-box address">' +
                        '<span class="tit">地点：<a ng-bind="$index+1"></a></span>' +
                        '<input type="text" ng-mouseenter="isShowTipsB=true" ng-mouseleave="isShowTipsB=false" is-show-tips="isShowTipsB" ng-model="item.name" name="address{{$index}}" validator="spechar,required" class="form-control mr10" />' +
                        '</div>' +
                        '<div class="input-group search_input_group fl">' +
                        '<map-suggestion-event address-name="item.searchName" index="{{$index}}" address-value="item.value" myblur="myblur($index)" myfocus="myfocus($index)" map="status.map"></map-suggestion-event>' +
                        '</div>' +
                        '<div class="operation">' +
                        '<span ng-click="moveUp($index)" class="moveUp">上移</span><span ng-click="moveDown($index)" class="moveDown">下移</span><span ng-click="deletePlace($index)" class="del">删除</span>' +
                        '</div>' +
                        '</div>';
                    suggestionHtml = $compile(suggestionHtml)($scope);
                    $($(angular.element(document)).find('map')).append(suggestionHtml);
                    var geoc = new BMap.Geocoder();
                    $scope.status.map.addEventListener("click", function(e) {
                        if (angular.isUndefined($scope.status.selectedInputIndex)) {
                            trsconfirm.alertType("请先选中地点输入框", "", "warning", false);
                            return;
                        }
                        removeMaker($scope.status.selectedInputIndex);
                        setMarker(e.point.lat, e.point.lng, $scope.status.selectedInputIndex);
                        geoc.getLocation(e.point, function(rs) {
                            var addComp = rs.addressComponents;
                            $timeout(function() {
                                $scope.data.PLACE[$scope.status.selectedInputIndex].searchName = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                                $scope.data.PLACE[$scope.status.selectedInputIndex].value = e.point;
                            });
                        });
                    });
                });
            }
            //聚焦输入框
            $scope.myfocus = function(index) {
                $timeout(function() {
                    $scope.status.selectedInputIndex = index;
                }, 100);
            };
            //失焦输入框
            $scope.myblur = function(index) {
                delete $scope.status.selectedInputIndex;
            };
            //上移
            $scope.moveUp = function(index) {
                if (index === 0) return;
                var temp = $scope.data.PLACE[index];
                $scope.data.PLACE[index] = $scope.data.PLACE[index - 1];
                $scope.data.PLACE[index - 1] = temp;
                var tempHtml = $($(".tangram-suggestion-main")[index]).html();
                $($(".tangram-suggestion-main")[index]).html($($(".tangram-suggestion-main")[index-1]).html());
                $($(".tangram-suggestion-main")[index-1]).html(tempHtml);
                initMarker();
            };
            //下移
            $scope.moveDown = function(index) {
                if (index === ($scope.data.PLACE.length - 1)) return;
                var temp = $scope.data.PLACE[index];
                $scope.data.PLACE[index] = $scope.data.PLACE[index + 1];
                $scope.data.PLACE[index + 1] = temp;
                var tempHtml = $($(".tangram-suggestion-main")[index]).html();
                $($(".tangram-suggestion-main")[index]).html($($(".tangram-suggestion-main")[index+1]).html());
                $($(".tangram-suggestion-main")[index+1]).html(tempHtml);
                initMarker();
            };
            //删除地点
            $scope.deletePlace = function(index) {
                if ($scope.data.PLACE.length === 1) {
                    trsconfirm.alertType("至少填写一个地址", "", "warning", false);
                    return;
                }
                $scope.data.PLACE.splice(index, 1);
                removeMaker(index);
                initMarker();
            };

            function removeMaker(index) {
                var allOverlay = $scope.status.map.getOverlays();
                if (allOverlay.length > 1) {
                    for (var k = 0; k < allOverlay.length; k++) {
                        if (allOverlay[k].myIndex === index.toString()) {
                            $scope.status.map.removeOverlay(allOverlay[k]);
                            break;
                        }
                    }
                }
            }
            //初始化地图地点
            function initMarker() {
                for (var i = 0; i < $scope.data.PLACE.length; i++) {
                    var lat = angular.isUndefined($scope.data.PLACE[i].value) ? "" : $scope.data.PLACE[i].value.lat;
                    var lng = angular.isUndefined($scope.data.PLACE[i].value) ? "" : $scope.data.PLACE[i].value.lng;
                    setMarker(lat, lng, i);
                }
            }
            //设置地图坐标
            function setMarker(lat, lng, index) {
                if (lat !== "") {
                    var point = new BMap.Point(lng, lat);
                    var marker = new BMap.Marker(point);
                    var label = new BMap.Label(index + 1, { offset: new BMap.Size(3, 0) });
                    marker.myIndex = index.toString();
                    marker.setLabel(label);
                    $scope.status.map.addOverlay(marker);
                }
            }
            //清除百度地图suggestion div
            function clearSuggestionDiv() {
                $(".tangram-suggestion-main").each(function(index) {
                    $(this).removeClass('tangram-suggestion-main');
                });
            }
        }
    ]);
