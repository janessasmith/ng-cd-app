angular.module('reportdailyselectModule', [])
    .controller('reportdailyselectCtrl', function($scope, $state, dateFilter, $location,$stateParams, trsspliceString, plancenterService, planCtrModalService, trsconfirm) {
        var vm = $scope.vm = {
            depts: [],
            dept: null
        };
        var format = 'yyyy-MM-dd';
        var yesterday = '昨天';
        var today = '今天';
        var tomorrow = '明天';
        vm.arr = [1, 2, 3, 4, 6];

        $scope.tags = ["普通", "重要", "紧急", "敏感", "精选"];
        //{ "0": "普通", "1": "重要", "2": "紧急", "3": "敏感", "4": "精选" };
        var init = function() {
            vm.time = [];
            vm.search = {
                date:  $stateParams.date || new Date(),
                datestr: dateFilter(new Date(), format),
                deptId: null
            }
            vm.keywords = '';
            for (var i = -3; i <= 3; i++) {
                var d = new Date();
                d.setDate(d.getDate() + i)
                var text = i == -1 ? yesterday : i == 0 ? today : i == 1 ? tomorrow : dateFilter(d, format);
                vm.time.push({ text: text, date: d, dftStr: dateFilter(d, format) });
            };
        };
        var getTopicList = function() {
            var params = {
                Time: dateFilter(vm.search.date, format),
                DepartId: vm.search.deptId ? vm.search.deptId : null
            }
            plancenterService.getDailyscribe(params).then(function(res) {
                if (res.DATA && res.DATA.length > 0) {
                    var arr = [];
                    var topicid=$stateParams.topicId;  
                    var topic=res.DATA[0];
                    angular.forEach(res.DATA, function(item, idx) {
                        item.isexpanded = false;
                        topic=item.TOPICID==topicid?item:topic;
                        arr.push(item);
                    });
                    vm.topics = arr;
                    if (vm.depts.length == 0) {
                        angular.forEach(res.DEPART, function(item, idx) {
                            vm.depts.push({ name: item.DEPARTNAME, value: item.DEPARTID });
                        })
                        if (vm.depts.length > 0) {
                            vm.dept = vm.depts[0];
                        }
                    }
                    $scope.getReportList(topic);
                } else {
                    vm.topics = [];
                    vm.depts = [];
                }
            });
        }; 

        var refreshReportList = function(topic) {
            if (!topic.pageParams) {
                topic.pageParams = {
                    PageId: 1
                }
            }
            topic.loadingBusy = true;
            plancenterService.getDailyBestReport(topic.TOPICID, topic.pageParams).then(function(res) {
                topic.isloaded = true;
                topic.loadingBusy = false;
                topic.reports = res.DATA;
                angular.forEach(topic.reports, function(report, idx) {
                    report.isexpanded = typeof report.isexpanded == 'undefined' || report.isexpanded == null ? false : report.isexpanded;
                });
            });
        };
        $scope.selectKeywords = function(report) {
            var keywordArr = [];
            angular.forEach(report.KEYWORDS, function(item, idx) {
                keywordArr.push(item.name);
            });
            vm.keywords = keywordArr.join(',') + ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,';
        }
        $scope.searchWithDept = function() {
            vm.search.deptId = vm.dept.value;
            getTopicList();
        }

        $scope.toRemarkReport = function(report) {
            var replyModal = planCtrModalService.replyReport(report, 'record');
            replyModal.result.then(function(data) {
                if (data.ISSUCCESS === 'true') {
                    $scope.getReplyList(report);
                }
            })
        }

        $scope.toggleReplyList = function(report) {
            report.isexpanded = !report.isexpanded;
            if (report.isexpanded) {
                $scope.getReplyList(report);
            }
        };
        $scope.getReplyList = function(report) {
            plancenterService.invoke('queryRemarks', { ReportId: report.REPORTID }).then(function(res) {
                report.replies = res;
            });
        };

        $scope.toggleReport = function(report, topic) {
            report.ischecked = !report.ischecked;
        };
        $scope.getReportList = function(topic) {
            var flag = topic.isexpanded;
            angular.forEach(vm.topics, function(item, idx) {
                 item.isexpanded =item.isexpanded == true?false:false;
            });
            topic.isexpanded = !flag;
            if (topic.isloaded) return;
            refreshReportList(topic);
        };
        $scope.deleteSelectedTopic = function() {
            var topic = getselectTopic();
            if (!topic) {
                return;
            }
            trsconfirm.alertType("确定要撤回该帖?", "", "info", true, function() {
                plancenterService.invoke('delSelectedPlanTopic', { TopicId: topic.TOPICID }).then(function(data) {
                    if (data.ISSUCCESS === 'true') {
                        getTopicList();
                    }
                });
            });
        };

        $scope.deleteSelectedReports = function(topic) {
            var topic = getselectTopic();
            if (!topic) {
                return;
            }
            var bestReports = trsspliceString.filter(topic.reports, 'REPORTID', 'ischecked', true);
            if (bestReports.length == 0) {
                trsconfirm.alertType('没有选中的报题，点击楼层序号选中！', '', "warning", false);
                return false;
            }
            trsconfirm.alertType("确定要撤回这些报题?", "", "info", true, function() {
                plancenterService.invoke('delSelectedPlanReport', { ReportIds: bestReports.join(',') }).then(function(data) {
                    if (data.ISSUCCESS === 'true') {
                        getTopicList();
                    }
                });
            });
        };

        var getselectTopic = function() {
            var topic = null;
            angular.forEach(vm.topics, function(item, idx) {
                if (item.isexpanded == true) topic = item;
            });
            if (!topic) {
                trsconfirm.alertType('请展开一个帖子！', '', "warning", false);
                return false;
            }
            return topic
        }

        $scope.listSearchTime = function(time) {
            vm.search.date = time.date;
        }
        $scope.$watch('vm.search.date', function(newval, oldval) {
            vm.search.datestr = dateFilter(vm.search.date, format);
            vm.depts = [];
            getTopicList();
        });
        $scope.preFix = function(text) {
            var t = text ? text.replace(/\n/g, '<br>') : null;
            return t;
        };
        var moveId = '',
            beginIdx = 0,
            movedIdx = 0;
        $scope.beginToMove = function(idx, report) {
            moveId = report.REPORTID;
            beginIdx = idx;
        };
        $scope.saveNewQueue = function(topic) {
            angular.forEach(topic.reports, function(report, idx) {
                if (report.REPORTID == moveId) {
                    movedIdx = idx;
                    return;
                }
            });
            if (beginIdx !== movedIdx) {
                plancenterService.invoke('moveReport', { ReportId: moveId, OrderId: movedIdx + 1, Flag: beginIdx < movedIdx ? 1 : -1 }).then(function(data) {
                    if (data.ISSUCCESS === 'true') {
                        refreshReportList(topic);
                    }
                });
            }
        };

        $scope.viewtask = function(report) {
            if (report.HAVETASK ===undefined || report.HAVETASK == 0) {

                $state.go("plan.dailyselection.newtask", { reportId: report.REPORTID });
            } else {
                $state.go("plantaskdetail", { taskid: report.HAVETASK });
            }
        }


        $scope.viewArticle = function(report) {
            if (report.HAVEARTICLE ===undefined  || report.HAVEARTICLE == 0) {
                window.open('/#/dailyselectionnews?status=0&reportId='+report.REPORTID); 
            } else {
                $state.go("iwopreview", { metadataid: report.HAVEARTICLE,modalname:'iwo.personal',type:'1'});
            }
        }
         $scope.createHotevent = function(report) {
            if (report.HAVEEVENT ===undefined  || report.HAVEEVENT == 0) { 
                $state.go("plan.dailyselection.newHotEvent", { reportId: report.REPORTID,eventtype:'personal',createtype:'manual',eventid:0,sourcedate:dateFilter(vm.search.date, format),sourceId: report.TOPICID});
            } else { 
                $state.go("eventdetail.eventanalyisbasicinfo", { eventid: report.HAVEEVENT,eventtype:0});
            }
        }

        init();
    })
