'use strict';
angular.module('pickReportsModule', []).
controller('confirmPickReportsCtrl', function($scope, $modalInstance, $validation, planCtrModalService, plancenterService, topic, reports) {
    $scope.topic = topic;
    $scope.reports = reports;
    $scope.showcheckpage = true;
    $scope.tags = [{ "value": "0", "label": "普通" },
        { "value": "1", "label": "重要" },
        { "value": "2", "label": "紧急" },
        { "value": "3", "label": "敏感" },
        { "value": "4", "label": "精选" }
    ];
    var init = function() {
        angular.forEach($scope.reports, function(report, index) {
             report.selectedTag=angular.copy($scope.tags[0]);
        });
    } 
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.submit = function(form) {
        var flag = $validation.checkValid(form);
        if (flag) {
            var reportsArr = [];
            angular.forEach($scope.reports, function(report, index) {
                reportsArr.push({
                    ReportId: report.REPORTID,
                    KeyWords: report.keywords,
                    Statement: report.statement,
                    Flag:report.selectedTag.value,
                    SelectedContent: report.SelectedContent ? report.SelectedContent : ""
                })
            });
            plancenterService.invoke('pushSelected', { json: JSON.stringify(reportsArr) }).then(function(data) {
                $modalInstance.close(data);
            });
        } else {
            angular.forEach($scope.reports, function(report, index) {
                if (!report.statement || !report.statement.length > 0) {
                    report.statementTip = true;
                }
            });
        }
    };
    $scope.checkcomfirm = function() {
        angular.forEach($scope.reports, function(report, index) {
            if (!report.statement || !report.statement.length > 0) {
                return true
            }
            if (!report.keywords || !report.keywords.length > 0) {
                return true;
            }
        });
        return false;
    }
    $scope.viewReport = function(report) {
        $scope.showcheckpage = false;
        $scope.report = report;
        plancenterService.invoke('getPlanReport', { ReportId: report.REPORTID }).then(function(data) {
            $scope.replies = data.REPORT_REPLIESINFO;
        });
    };
    $scope.cancelview = function() {
        $scope.showcheckpage = true;
    }
    $scope.editReport = function(report) {
        report.editing = true;
        if (report.SelectedContent) return;
        report.SelectedContent = angular.element(report.CONTENT).text();
    };
    $scope.saveReport = function(report) {
        report.editing = false;
    }

    $scope.deleteReport = function(report) {
        var arr = [];
        angular.forEach($scope.reports, function(item, idx) {
            if (item != report) arr.push(item);
        })
        $scope.reports = arr;
    }

    init();
})
