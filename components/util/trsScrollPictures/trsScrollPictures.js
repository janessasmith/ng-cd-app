'use strict';
/** creatyBy fanglijuan
 *   Module  
 *
 * Description
 */
angular.module('util.trsScrollPicturesModule', []).directive('trsScrollPictures', ['$timeout', "$window", "$compile", function($timeout, $window, $compile) {
    // Runs during compile
    return {
        replace: false,
        scope: {
            sliderPic: "=",
            sliderSmallPic: "=",
            addCreate: '='
        },
        restrict: "AE",
        templateUrl: "./components/util/trsScrollPictures/trsScrollPictures_tpl.html",
        link: function(scope, iElm, iAttrs, controller) {
            init();

            function init() {
                scope.status = {
                    isshowlarge: false,
                    sliderSmallPicArray: [],
                    isSmallPicListShow: false
                };
                scope.$watch('sliderSmallPic', function(nvl, ovl) {
                    if (angular.isDefined(nvl)) {
                        angular.forEach(scope.sliderSmallPic, function(data, index, array) {
                            loadImage(data, index);
                        });
                    }
                });
                // loadImgDirective();
            }

            function loadImage(imgSrc, index) {
                var img = new Image();
                img.src = imgSrc;
                img.onload = function() {
                    $timeout(function() {
                        var width = img.width;
                        var height = img.height;
                        var aspectRatio = width / height;
                        var limitWidth = aspectRatio > 1 ? 80 * aspectRatio : 80;
                        var limitHeight = aspectRatio > 1 ? 80 : 80 / aspectRatio;
                        var marginleft = aspectRatio > 1 ? (limitWidth - 80) / 2 : 0;
                        scope.status.sliderSmallPicArray[index] = { src: img.src, style: { width: limitWidth + "px", height: limitHeight + "px", 'margin-left': "-" + marginleft + "px" } };
                        if (scope.sliderSmallPic.length === scope.status.sliderSmallPicArray.length) {
                            scope.status.isSmallPicListShow = true;
                        }
                    });
                };
                img.onerror = function() {
                    $timeout(function() {
                        scope.sliderSmallPic.splice(index, 1);
                        scope.status.sliderSmallPicArray.splice(index, 1);
                        if (scope.sliderSmallPic.length === scope.status.sliderSmallPicArray.length) {
                            scope.status.isSmallPicListShow = true;
                        }
                    });
                };
            }
            $timeout(function() {
                if (scope.sliderPic != null) {
                    scope.len = scope.sliderPic.length;
                }
            }, 500);
            //显示幻灯片大图
            scope.showBigPics = function(index) {
                /*console.log(index);*/
                scope.status.initIndex = index;
                /*$(".myCarousel").carousel(index);*/
                scope.status.isshowlarge = true;
                /*$(".myCarousel").carousel('cycle');*/
            };
            //隐藏幻灯片大图
            scope.hideBigPics = function() {
                scope.status.isshowlarge = false;
                delete scope.status.initIndex;
            };
            /**
             * [loadImgDirective description]动态加载图片显示指令
             */
            // function loadImgDirective() {
            //     var canAddCreate = scope.addCreate ? " trs-add-to-create " : "",
            //         directive = [
            //             '<div class="carousel-row"' + canAddCreate + '>',
            //             '<div class="up_close">',
            //             '<a ng-click="hideBigPics();"><img src="./components/util/trsScrollPictures/images/up_close.png" />收起</a>',
            //             '</div>',
            //             '<carousel interval="myInterval" no-wrap="noWrapSlides" template-url="./components/util/trsScrollPictures/template/carousel_tpl.html" status="status" pics="sliderSmallPic">',
            //             '<slide class="carousel-list" ng-repeat="slide in sliderPic">',
            //             '<div class="carousel-img">',
            //             '<img ng-src="{{slide}}" class="pointer" ng-click="hideBigPics()" height="100%">',
            //             '</div>',
            //             '</slide>',
            //             '</carousel>',
            //             '</div>'
            //         ];
            //     directive = $compile(directive.join(''))(scope);
            //     $($(angular.element(document)).find('scrollDir')).append(directive);
            // };
        }
    };
}]);
