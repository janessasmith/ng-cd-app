"use strict";

/**
 * created by zheng.lu in 2017.3.09
 */
angular.module('subscribeServiceModule', [])
    .factory('subscribeService', function() {
            return {
                initSubscribeMedia: function() {
                    var subMediaArray = [
                        {
                            'mediaName': '网站',
                            'mediaType': 1,
                            'type': 'website',
                            'params': 'website'
                        },
                        {
                            'mediaName': 'APP',
                            'mediaType': 2,
                            'type': 'app',
                            'params': 'app'
                        },
                        {
                            'mediaName': '微信',
                            'mediaType': 3,
                            'type': 'weixin',
                            'params': 'weixin'
                        },
                        {
                            'mediaName': '微博',
                            'mediaType': 4,
                            'type': 'weibo',
                            'params': 'weibo'
                        }
                    ];
                    return subMediaArray;
                }
            };
    });