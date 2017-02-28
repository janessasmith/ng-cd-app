/**
 Created by fanglijuan on 2016/08/01.  微信编辑器
 html:
 description: 

**/
"use strict";
angular.module("util.trsWeChatEditorModule", ["trsWetchatTemplateServiceModule"]).directive("trsWeChatEditor", ["$compile", "trsWetchatTemplateService", "$timeout",
    function($compile, trsWetchatTemplateService, $timeout) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: "./components/util/trsWeChatEditor/trsWeChatEditor.html",
            scope: {
                wechatTemplate: "=",
                getSection: "&"
            },
            link: function(scope, element, attrs, controller) {
                init();

                function init() {
                    scope.status = {
                        tabLists: {
                            title: "标题",
                            content: "正文",
                            picture: "图片",
                            imageText: "图文",
                            layout: "布局",
                            colorScheme: "配色方案"
                        },
                        html: {
                            content: [],
                            title: [],
                            layout: [],
                            imageText: [],
                            picture: []
                        },
                        newColor: "" //新的颜色
                    };
                    scope.weChatEditorColor = "";
                    scope.isSelectedTab = scope.status.tabLists.title;
                    showSelectedCon("title");
                }
                /**
                 * [showTab description  点击tab切换当前模块]
                 * @param  {[type]} name [description]
                 * @return {[type]}      [description]
                 */
                scope.showTab = function(name) {
                    showSelectedCon(name);
                };
                /**
                 * [showSelectedCon description显示当前模块]
                 * @param  {[type]} name [description]
                 * @return {[type]}      [description]
                 */
                function showSelectedCon(name) {
                    scope.isSelectedTab = scope.status.tabLists[name];
                    if ($(element).find("ul[id$='" + name + "']").html() === "") {
                        trsWetchatTemplateService.getTemplate(name).then(function(data) {
                            $(element).find("ul[id$='" + name + "']").html($compile(data)(scope))//.fadeIn(100);
                        });
                    }
                    if (scope.status.newColor != "") {
                        $timeout(function() {
                            findChangeColorModule(scope.status.newColor);
                        }, 100);
                    }
                }
                /**
                 * [getHtmlToUEditor description点击选取标签到右侧编辑器中]
                 * @param  {[type]} event [description]
                 * @return {[type]}       [description]
                 */
                scope.getHtmlToUEditor = function(event) {
                    scope.wechatTemplate = event.currentTarget.outerHTML;
                    scope.getSection();
                };
                /**
                 * [description监听：配色改变]
                 * @param  {[type]} newValue [description]
                 * @param  {[type]} oldValue [description]
                 * @param  {[type]} scope)   {                           if (newValue ! [description]
                 * @return {[type]}          [description]
                 */
                scope.$watch('weChatEditorColor', function(newValue, oldValue, scope) {
                    if (newValue != oldValue && newValue != null) {
                        scope.status.newColor = angular.copy(newValue);
                        findChangeColorModule(scope.status.newColor);
                    }
                });

                function findChangeColorModule(newValue) {
                    element.find("section").each(function(i, n) {
                        var obj = $(n);
                        obj.find("section").each(function() {
                            var thisObj = $(this);
                            changeColor(thisObj, newValue);
                        });
                        obj.find("h2").each(function() {
                            var thisObj = $(this);
                            changeColor(thisObj, newValue);
                        });
                        obj.find("p").each(function() {
                            var thisObj = $(this);
                            changeColor(thisObj, newValue);
                        });
                        obj.find("span").each(function() {
                            var thisObj = $(this);
                            changeColor(thisObj, newValue);
                        });
                        obj.find("strong").each(function() {
                            var thisObj = $(this);
                            changeColor(thisObj, newValue);
                        });
                        obj.find("blockquote").each(function() {
                            var thisObj = $(this);
                            changeColor(thisObj, newValue);
                        });
                        obj.find("hr").each(function() {
                            var thisObj = $(this);
                            changeColor(thisObj, newValue);
                        });
                    });
                }

                function changeColor(obj, newValue) {
                    if (obj.attr("border-color") == "change") {
                        obj.css("border-color", newValue);
                    }
                    if (obj.attr("font-color") == "change") {
                        obj.css("color", newValue);
                    }
                    if (obj.attr("background-color") == "change") {
                        obj.css("background-color", newValue);
                    }
                    if (obj.attr("border-top-color") == "change") {
                        obj.css("border-top-color", newValue);
                    }
                    if (obj.attr("border-bottom-color") == "change") {
                        obj.css("border-bottom-color", newValue);
                    }
                    if (obj.attr("border-left-color") == "change") {
                        obj.css("border-left-color", newValue);
                    }
                    if (obj.attr("border-right-color") == "change") {
                        obj.css("border-right-color", newValue);
                    }

                    //特殊颜色
                    if (obj.attr("font-color") == "white") {
                        obj.css("color", "white");
                    }

                }
            }
        };
    }
]);
