'use strict';
/**
 *  Module  单选框的数据
 *
 * Description
 * auth  SMG
 */
angular.module('newsFocusServiceModule', [])
    .factory('newsFocusServiceSelecet', [function() {
        return {
            //领域
            fieldType: function() {
                var fieldJsons = [{
                    name: '政治',
                    value: 'zyzxfield_001'
                }, {
                    name: '财经',
                    value: 'zyzxfield_002'
                },{
                    name: '司法',
                    value: 'zyzxfield_003'
                }, {
                    name: '军事',
                    value: 'zyzxfield_004'
                }, {
                    name: '社会',
                    value: 'zyzxfield_005'
                }, {
                    name: '地产',
                    value: 'zyzxfield_006'
                }, {
                    name: '科技',
                    value: 'zyzxfield_007'
                }, {
                    name: '人文',
                    value: 'zyzxfield_008'
                }, {
                    name: '体育',
                    value: 'zyzxfield_009'
                }, {
                    name: '教育',
                    value: 'zyzxfield_010'
                }, {
                    name: '生活',
                    value: 'zyzxfield_011'
                }, {
                    name: '健康',
                    value: 'zyzxfield_012'
                }, {
                    name: '汽车',
                    value: 'zyzxfield_013'
                }, {
                    name: '美食',
                    value: 'zyzxfield_014'
                }, {
                    name: '旅游',
                    value: 'zyzxfield_015'
                }, {
                    name: '游戏',
                    value: 'zyzxfield_016'
                }, {
                    name: '动漫',
                    value: 'zyzxfield_017'
                }, {
                    name: '电商',
                    value: 'zyzxfield_018'
                }, {
                    name: '娱乐',
                    value: 'zyzxfield_019'
                }];
                return fieldJsons;
            },
        };
    }]);
