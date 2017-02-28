/*Create by CC 2015-12-25
    iwo编辑页面底部按钮权限
*/
"use strict";
angular.module('iWoinitBtnModule', []).
factory('iWoinitBtnService', function() {
    return {
        /**
         * [initBtnArrays description]个人稿库所需按钮
         * @return {[type]} [description]
         */
        initBtnArrays: function() {
            var personBtnArray = [{
                "RIGHTINDEX": 4,
                "OPERDESC": "传稿",
                "OPERFUN": "iWoTransfer",
            }, {
                "RIGHTINDEX": 3,
                "OPERDESC": "上栏",
                "OPERFUN": "iWoSubmit",
            }, {
                "RIGHTINDEX": 5,
                "OPERDESC": "共享",
                "OPERFUN": "iWoShare",
            },{
                "RIGHTINDEX":484,
                "OPERDESC":"提交",
                "OPERFUN":"iWoDraft"
            }];
            var receivedBtnArray = [{
                "RIGHTINDEX": 12,
                "OPERDESC": "传稿",
                "OPERFUN": "iWoTransfer",
            }, {
                "RIGHTINDEX": 15,
                "OPERDESC": "上栏",
                "OPERFUN": "iWoSubmit",
            }, {
                "RIGHTINDEX": 13,
                "OPERDESC": "共享",
                "OPERFUN": "iWoShare",
            },{
                "RIGHTINDEX":485,
                "OPERDESC":"提交",
                "OPERFUN":"iWoDraft"
            }];
            var arrayBtn = [personBtnArray, receivedBtnArray];
            return arrayBtn;
        },
        /**
         * [initDepartArrays description]已收稿库所需按钮
         * @return {[type]} [description]
         */
        initDepartArrays: function() {
            var departmentArray = [{
                "RIGHTINDEX": 475,
                "OPERDESC": "上栏",
                "OPERFUN": "iWoSubmit",
            }, {
                "RIGHTINDEX": 476,
                "OPERDESC": "传递",
                "OPERFUN": "departmentDraft",
            }, {
                "RIGHTINDEX": 477,
                "OPERDESC": "共享",
                "OPERFUN": "iWoShare",
            }];
            return departmentArray;
        }
    };
});
