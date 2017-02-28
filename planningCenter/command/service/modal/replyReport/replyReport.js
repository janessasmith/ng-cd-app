'use strict';
angular.module('replyReportModule', []).
controller('replyReportCtrl', function($scope, $modalInstance, trsspliceString, Upload, plancenterService, report, type) {
    var ue; 
    $scope.report = report;
    $scope.submit = function() {
        if (type == 'record') {
            plancenterService.invoke('saveRemarks', { ReportId: report.REPORTID, ParentId: 0, Value: ue.getContent(), ReplyId: 0 }).then(function(data) {
                $modalInstance.close(data);
            });
        } else {
            plancenterService.invoke('savePlanReplies', { ReportId: report.REPORTID, ParentId: 0, AddContent: ue.getContent(), ReplyId: 0 }).then(function(data) {
                $modalInstance.close(data);
            });
        }
    };
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    LazyLoad.js(["./lib/ueditor2/ueditor.config.js?v=6.0", "./lib/ueditor2/ueditor.all.js?v=6.0"], function() {
        ue = UE.getEditor('replyEditer', {
            toolbars: [
                ['bold', 'italic', 'underline', 'strikethrough', '|', 'forecolor', 'fontsize', 'insertimage', 'attachment']
            ],
            zIndex: 2000,
            initialFrameHeight: 100
        });
    });
})
