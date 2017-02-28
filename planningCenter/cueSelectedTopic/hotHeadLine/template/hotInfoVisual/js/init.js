(function() {
    var hotPonitStatus; //热点分布搜索状态区分 1为精确 0为疑似
    var hotInfoVisual = {};
    window.hotInfoVisual = hotInfoVisual;

    var date = new Date();
    hotInfoVisual.time = {
        curTime: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds()
        }
    };

    hotInfoVisual.time.toDayString = function(timeObj, separator) {
        var spt = separator ? separator : ".";
        var month = timeObj.month < 10 ? "0" + timeObj.month : timeObj.month;
        var day = timeObj.day < 10 ? "0" + timeObj.day : timeObj.day;
        return timeObj.year + spt + month + spt + day;
    }
    hotInfoVisual.time.toDayNoYearString = function(timeObj, separator) {
        var spt = separator ? separator : ".";
        var month = timeObj.month < 10 ? "0" + timeObj.month : timeObj.month;
        var day = timeObj.day < 10 ? "0" + timeObj.day : timeObj.day;
        return month + spt + day;
    }
    hotInfoVisual.time.update = function(timeObj, newTime) {
        if (!newTime) {
            newTime = new Date();
        }
        timeObj.year = newTime.getFullYear();
        timeObj.month = newTime.getMonth() + 1;
        timeObj.day = newTime.getDate();
        timeObj.hours = newTime.getHours();
        timeObj.minutes = newTime.getMinutes();
        timeObj.seconds = newTime.getSeconds();
    }
    hotInfoVisual.drawCategory = function(container, categories, curSelectedCatetory, eventFn) {
        var htmls = [];
        for (var i = 0, length = categories.length; i < length; i++) {
            htmls.push("<div class='item'>");
            htmls.push("<span>");
            htmls.push(categories[i].name);
            htmls.push("</span>");
            htmls.push("</div>");
        }
        container.empty().append(htmls.join(""));
        var itemEles = container.find(".item");
        itemEles.each(function(index, element) {
            var curElement = $(element);
            var category = categories[index];
            curElement.data('category', category);
            if (curSelectedCatetory.id == category.id) {
                curElement.addClass('selected');
            }
            curElement.bind('click', function(e) {
                var currentTarget = $(e.currentTarget);
                var currentTargetCategory = currentTarget.data('category');
                if (currentTargetCategory.id == curSelectedCatetory.id) {
                    return;
                } else {
                    curSelectedCatetory = $.extend(true, curSelectedCatetory, currentTargetCategory);
                    itemEles.removeClass("selected");
                    currentTarget.addClass('selected');
                    if (eventFn) {
                        eventFn();
                    }
                }
            })
        });
    }
    hotInfoVisual.initTimePicker = function(container, tag, curTimeObj, callback) {
        container.calendar({
            controlId: "calendar_" + tag, // 弹出的日期控件ID，默认: $(this).attr("id") + "Calendar"
            speed: 100, // 三种预定速度之一的字符串("slow", "normal", or "fast")或表示动画时长的毫秒数值(如：1000),默认：200
            complement: true, // 是否显示日期或年空白处的前后月的补充,默认：true
            readonly: true, // 目标对象是否设为只读，默认：true
            upperLimit: new Date(), // 日期上限，默认：NaN(不限制)
            // lowerLimit: new Date("2011/01/01"), // 日期下限，默认：NaN(不限制)
            callback: function() { // 点击选择日期后的回调函数
                // alert("您选择的日期是：" + $("#txtBeginDate").val());
                var newTimes = container.val().split("-");
                curTimeObj.year = Number(newTimes[0]);
                curTimeObj.month = Number(newTimes[1]);
                curTimeObj.day = Number(newTimes[2]);
                if (callback) {
                    callback();
                }
            }
        });
    }
    hotInfoVisual.drawNewsList = function(newsListContainer, pagesContainer, curPanelObj, newsAreaNameContainer, curPage) {
        if (newsListContainer.length <= 0) {
            return;
        }
        if (curPage) {
            curPanelObj.curPage.index = curPage.index;
        } else {
            curPanelObj.curPage.index = 0;
        }
        var parameters = {
            // cluster_name: curPanelObj.cluser,
            // cluster_name: curPanelObj.cluser + "_" + curPanelObj.curSelectedLoadDays.value,
            loaddate: hotInfoVisual.time.toDayString(curPanelObj.time, "-"),
            // area: curPanelObj.curArea.id,
            // loaddays: curPanelObj.curSelectedLoadDays.value,
            startpage: curPanelObj.curPage.index,
            pagesize: 10,
            user_id: "admin",
            department: "admin"
        }
        if (curPanelObj.tag == 'zheJiang' && curPanelObj.cluser.indexOf('_') > -1) {
            parameters.cluster_name = curPanelObj.cluser;
        } else {
            parameters.cluster_name = curPanelObj.cluser + "_" + curPanelObj.curSelectedLoadDays.value;
        }
        if (curPanelObj.curSelectedCatetory.id) {
            parameters.field = curPanelObj.curSelectedCatetory.id;
        }
        parameters.field = "000";

        var areaEleObj = $("." + curPanelObj.tag + "Area");
        if (curPanelObj.curArea.id == curPanelObj.srcArea.id) {
            areaEleObj.addClass("scope-selected");
        } else {
            areaEleObj.removeClass("scope-selected");
        }

        newsListContainer.empty();
        pagesContainer.hide();
        parameters.startpage = curPanelObj.curPage.index;
        parameters.area = curPanelObj.curArea.id;
        if (curPanelObj.tag !== "zheJiang") {
            newsAreaNameContainer.empty().html(curPanelObj.curArea.name + "热点");
        } else {
            if (hotPonitStatus === undefined) {
                $("#accuracy").addClass('active');
                hotPonitStatus = 1;
            }
            parameters.subjectarea = hotPonitStatus;
            newsAreaNameContainer.empty().html("<button id='accuracy'>" + curPanelObj.curArea.name + "热点</button>&nbsp;<button id='seemingly'>疑似" + curPanelObj.curArea.name + "热点</button>");
            if (hotPonitStatus === 1) {
                $("#accuracy").addClass('active');
                $("#seemingly").removeClass('active');
            } else {
                $("#seemingly").addClass('active');
                $("#accuracy").removeClass('active');
            }
            $("#accuracy").bind("click", function() {
                hotPonitStatus = 1;
                hotInfoVisual.drawNewsList(newsListContainer, pagesContainer, curPanelObj, newsAreaNameContainer);
            });
            $("#seemingly").bind("click", function() {
                hotPonitStatus = 0;
                hotInfoVisual.drawNewsList(newsListContainer, pagesContainer, curPanelObj, newsAreaNameContainer);
            });
        }
        parameters.typeid = "widget";
        parameters.serviceid = "hotpoint";
        parameters.modelid = "hotnewslist";
        $.ajax({
            url: "/wcm/bigdata.do",
            data: parameters,
            dataType: "text",
            success: function(data) {
                var jsonData = JSON.parse(data);
                if (jsonData.ISSUCESS == 'false') {
                    console.log("获取‘热点文档列表’数据失败");
                    return;
                }
                var newsDatas = jsonData.CONTENT;
                if (!newsDatas) {
                    return;
                }
                var listHtmls = [];
                for (var i = 0, length = newsDatas.length; i < length && i < 10; i++) {
                    var newsData = newsDatas[i];
                    if (i % 2 == 0) {
                        listHtmls.push('<div class="news-item news-bg-blue">');
                    } else {
                        listHtmls.push('<div class="news-item">');
                    }
                    listHtmls.push('<div class="news-content">');
                    listHtmls.push('<a target="_blank" title="');
                    listHtmls.push(newsData.TITLE);
                    listHtmls.push('" href="/mediacube/#/resourcedetail?guid=');
                    listHtmls.push(newsData.GUID);
                    listHtmls.push('&indexname=');
                    listHtmls.push(newsData.TABLENAME);
                    listHtmls.push('&areaname=');
                    listHtmls.push(curPanelObj.curArea.name);
                    listHtmls.push('">');
                    listHtmls.push(newsData.TITLE);
                    listHtmls.push('</a>');
                    listHtmls.push('</div>');
                    listHtmls.push('<div class="news-visits">');
                    listHtmls.push('<span>');
                    var visits = newsData.CLUSTERNUMS || 1;
                    if (visits >= 10000) {
                        visits = visits / 10000;
                        visits = visits.toFixed('1') + "万";
                    }
                    listHtmls.push(visits);
                    listHtmls.push('</span>');
                    listHtmls.push('</div>');
                    listHtmls.push('</div>');
                }
                newsListContainer.empty();
                newsListContainer.append(listHtmls.join(""));

                // 分页处理
                // http://jqpaginator.keenwon.com/
                if (jsonData.TOTALPAGES == 0) {
                    pagesContainer.hide();
                    return;
                } else {
                    pagesContainer.show();
                }
                if (curPanelObj.curPage.init) {
                    pagesContainer.jqPaginator('option', {
                        currentPage: curPanelObj.curPage.index + 1,
                        // totalCounts: jsonData.TOTALELEMENTS,
                        totalPages: jsonData.TOTALPAGES
                    });
                } else {
                    curPanelObj.curPage.init = true;
                    pagesContainer.jqPaginator({
                        currentPage: curPanelObj.curPage.index + 1,
                        totalPages: jsonData.TOTALPAGES,
                        // totalCounts: jsonData.TOTALELEMENTS,
                        // pageSize: 10,
                        visiblePages: 17,
                        activeClass: "news-page-selected",
                        prev: "<div class='news-page-btn news-page-change'><span>&lt;</span></div>",
                        next: "<div class='news-page-btn news-page-change'><span>&gt;</span></div>",
                        page: "<div class='news-page-btn'><span>{{page}}</span></div>",
                        onPageChange: function(num, type) {
                            if (curPanelObj.curPage.index == --num) {
                                return;
                            }
                            curPanelObj.curPage.index = num;
                            hotInfoVisual.drawNewsList(newsListContainer, pagesContainer, curPanelObj, newsAreaNameContainer, curPanelObj.curPage);
                        }
                    });
                }
            }
        });
        //$.get("/widget/hotpoint/hotnewslist", parameters, function(data) {
        //});
    }
    hotInfoVisual.drawProvinceList = function(container, parameters, curPanelObj, newsListContainer, pagesContainer, newsAreaNameContainer) {
        if (container.length <= 0) {
            return;
        }
        container.empty();
        //$.get("/widget/hotpoint/countryhotpoint", parameters, function(data) {
        parameters.typeid = "widget";
        parameters.serviceid = "hotpoint";
        parameters.modelid = "countryhotpoint";
        $.ajax({
            url: "/wcm/bigdata.do",
            data: parameters,
            dataType: "text",
            success: function(data) {
                var jsonData = JSON.parse(data);
                if (jsonData.ISSUCESS == 'false') {
                    console.log("获取‘地域统计——全国区域热点排行’数据失败");
                    return;
                }
                var listHtmls = [];
                for (var i = 0, length = jsonData.length; i < length && i < 10; i++) {
                    var province = jsonData[i];
                    listHtmls.push('<div class="province-list-item">');
                    listHtmls.push('<div>');
                    listHtmls.push('<span>');
                    listHtmls.push(i + 1);
                    listHtmls.push('</span>');
                    listHtmls.push('</div>');
                    listHtmls.push('<div areaname="' + province.AREANAME + '" area="' + province.AREA + '" class="province-list-item-bg ' + (curPanelObj.tag === 'zheJiang' ? 'zhejiang' : 'quanguo') + '">');
                    listHtmls.push('<span>');
                    listHtmls.push(province.AREANAME);
                    listHtmls.push('</span>');
                    listHtmls.push('</div>');
                    listHtmls.push('<div>');
                    listHtmls.push('<span>');
                    var visits = province.HOTNUM || 1;
                    if (visits >= 10000) {
                        visits = visits / 10000;
                        visits = visits.toFixed('1') + "万";
                    }
                    listHtmls.push(visits);
                    listHtmls.push('</span>');
                    listHtmls.push('</div>');
                    listHtmls.push('</div>');
                }
                container.append(listHtmls.join(""));
                var className = curPanelObj.tag === "zheJiang" ? "zhejiang" : "quanguo";
                $("." + className).each(function(index) {
                    $(this).bind("click", function() {
                        curPanelObj.curArea.id = $(this).attr("area");
                        curPanelObj.curArea.name = $(this).attr("areaname");
                        hotInfoVisual.drawNewsList(newsListContainer, pagesContainer, curPanelObj, newsAreaNameContainer)
                    });
                });
            }
        });
        // var jsonData = hotInfoVisual.quanQuoPanel.provinceList;
        //});
    }

    hotInfoVisual.drawLoadDaysList = function(container, loadDaysList, curLoadDays, callback) {
        var htmls = [];
        for (var i = 0, length = loadDaysList.length; i < length; i++) {
            htmls.push("<div>");
            htmls.push("<span>");
            htmls.push(loadDaysList[i].desc);
            htmls.push("</span>");
            htmls.push("</div>");
        }
        container.empty().append(htmls.join(""));
        var itemEles = container.find("div");
        itemEles.each(function(index, element) {
            var curElement = $(element);
            var loadDay = loadDaysList[index];
            curElement.data('loadDay', loadDay);
            if (curLoadDays.value == loadDay.value) {
                curElement.addClass('time-btn-selected');
            }
            curElement.bind('click', function(e) {
                var currentTarget = $(e.currentTarget);
                var currentTargetLoadDays = currentTarget.data('loadDay');
                if (currentTargetLoadDays.value == curLoadDays.value) {
                    return;
                } else {
                    // curLoadDays = currentTargetLoadDays;
                    $.extend(true, curLoadDays, currentTargetLoadDays);
                    itemEles.removeClass("time-btn-selected");
                    currentTarget.addClass('time-btn-selected');
                    if (callback) {
                        callback();
                    }
                }
            })
        });
    }

    // 将地图区域名称与cluster的对应关系记录下来
    hotInfoVisual.clusterNames = {
        "银川市": "area_001009001",
        "石嘴山市": "area_001009002",
        "吴忠市": "area_001009003",
        "固原市": "area_001009004",
        "中卫市": "area_001009005"
    };

    // 地图各区域的名称及地理坐标
    hotInfoVisual.mapArea = {
        name: {},
        geo: {}
    };

    hotInfoVisual.mapArea.name.china = [
        { "dictName": "上海", "dictNum": "001001" },
        { "dictName": "云南", "dictNum": "001002" },
        { "dictName": "内蒙古", "dictNum": "001003" },
        { "dictName": "北京", "dictNum": "001004" },
        { "dictName": "台湾", "dictNum": "001005" },
        { "dictName": "吉林", "dictNum": "001006" },
        { "dictName": "四川", "dictNum": "001007" },
        { "dictName": "天津", "dictNum": "001008" },
        { "dictName": "宁夏", "dictNum": "001009" },
        { "dictName": "安徽", "dictNum": "001010" },
        { "dictName": "山东", "dictNum": "001011" },
        { "dictName": "山西", "dictNum": "001012" },
        { "dictName": "广东", "dictNum": "001013" },
        { "dictName": "广西", "dictNum": "001014" },
        { "dictName": "新疆", "dictNum": "001015" },
        { "dictName": "江苏", "dictNum": "001016" },
        { "dictName": "江西", "dictNum": "001017" },
        { "dictName": "河北", "dictNum": "001018" },
        { "dictName": "河南", "dictNum": "001019" },
        { "dictName": "浙江", "dictNum": "001020" },
        { "dictName": "海南", "dictNum": "001021" },
        { "dictName": "湖北", "dictNum": "001022" },
        { "dictName": "湖南", "dictNum": "001023" },
        { "dictName": "澳门", "dictNum": "001024" },
        { "dictName": "甘肃", "dictNum": "001025" },
        { "dictName": "福建", "dictNum": "001026" },
        { "dictName": "西藏", "dictNum": "001027" },
        { "dictName": "贵州", "dictNum": "001028" },
        { "dictName": "辽宁", "dictNum": "001029" },
        { "dictName": "重庆", "dictNum": "001030" },
        { "dictName": "陕西", "dictNum": "001031" },
        { "dictName": "青海", "dictNum": "001032" },
        { "dictName": "香港", "dictNum": "001033" },
        { "dictName": "黑龙江", "dictNum": "001034" }
    ];
    hotInfoVisual.mapArea.name["宁夏"] = [
        { "dictName": "银川市", "dictNum": "001009001" },
        { "dictName": "石嘴山市", "dictNum": "001009002" },
        { "dictName": "吴忠市", "dictNum": "001009003" },
        { "dictName": "固原市", "dictNum": "001009004" },
        { "dictName": "中卫市", "dictNum": "001009005" },
    ];
    hotInfoVisual.mapArea.geo = {
        "china": [
            { "n": "北京", "g": "116.395645,39.929986" },
            { "n": "上海", "g": "121.487899,31.249162" },
            { "n": "天津", "g": "117.210813,39.14393" },
            { "n": "重庆", "g": "106.530635,29.544606" },
            { "n": "安徽", "g": "117.216005,31.859252" },
            { "n": "福建", "g": "117.984943,26.050118" },
            { "n": "甘肃", "g": "102.457625,38.103267" },
            { "n": "广东", "g": "113.394818,23.408004" },
            { "n": "广西", "g": "108.924274,23.552255" },
            { "n": "贵州", "g": "106.734996,26.902826" },
            { "n": "海南", "g": "109.733755,19.180501" },
            { "n": "河北", "g": "115.661434,38.61384" },
            { "n": "河南", "g": "113.486804,34.157184" },
            { "n": "黑龙江", "g": "128.047414,47.356592" },
            { "n": "湖北", "g": "112.410562,31.209316" },
            { "n": "湖南", "g": "111.720664,27.695864" },
            { "n": "江苏", "g": "119.368489,33.013797" },
            { "n": "江西", "g": "115.676082,27.757258" },
            { "n": "吉林", "g": "126.262876,43.678846" },
            { "n": "辽宁", "g": "122.753592,41.6216" },
            { "n": "内蒙古", "g": "114.415868,43.468238" },
            { "n": "宁夏", "g": "106.155481,37.321323" },
            { "n": "青海", "g": "96.202544,35.499761" },
            { "n": "山东", "g": "118.527663,36.09929" },
            { "n": "山西", "g": "112.515496,37.866566" },
            { "n": "陕西", "g": "109.503789,35.860026" },
            { "n": "四川", "g": "102.89916,30.367481" },
            { "n": "西藏", "g": "89.137982,31.367315" },
            { "n": "新疆", "g": "85.614899,42.127001" },
            { "n": "云南", "g": "101.592952,24.864213" },
            { "n": "浙江", "g": "119.957202,29.159494" },
            { "n": "香港", "g": "114.186124,22.293586" },
            { "n": "澳门", "g": "113.557519,22.204118" },
            { "n": "台湾", "g": "120.961454,23.80406" }
        ],
        "宁夏": [
            { "n": "银川", "g": "106.28 38.47" },
            { "n": "石嘴山", "g": "106.38 39.02" },
            { "n": "吴忠", "g": "106.2 37.98" },
            { "n": "固原", "g": "106.28 36.0" },
            { "n": "中卫", "g": "105.18 37.52" },
        ],
        "银川市": [{ "n": "银川市", "g": "106.28 38.47" },
            { "n": "兴庆区", "g": "106.28 38.48" },
            { "n": "西夏区", "g": "106.18 38.48" },
            { "n": "金凤区", "g": "106.25 38.47" },
            { "n": "永宁县", "g": "106.25 38.28" },
            { "n": "贺兰县", "g": "106.35 38.55" },
            { "n": "灵武市", "g": "106.33 38.1" }
        ],
        "石嘴山市": [{ "n": "石嘴山市", "g": "106.38 39.02" },
            { "n": "大武口区", "g": "106.38 39.02" },
            { "n": "惠农区", "g": "106.78 39.25" },
            { "n": "平罗县", "g": " 106.53 38.9" }
        ],
        "吴忠市": [{ "n": "吴忠市", "g": "106.2 37.98" },
            { "n": "利通区", "g": "106.2 37.98" },
            { "n": "盐池县", "g": "107.4 37.78 " },
            { "n": "同心县", "g": "105.92 36.98" },
            { "n": "青铜峡市", "g": "106.07 38.02" }
        ],
        "固原市": [{ "n": "固原市", "g": "106.28 36.0" },
            { "n": "原州区", "g": "106.28 36.0" },
            { "n": "西吉县", "g": "105.73 35.97" },
            { "n": "隆德县", "g": "106.12 35.62" },
            { "n": "泾源县", "g": "106.33 35.48" },
            { "n": " 彭阳县", "g": "106.63 35.85" }
        ],
        "中卫市": [{ "n": "中卫", "g": "105.18 37.52" },
            { "n": "沙坡头区", "g": "105.18 37.52" },
            { "n": "海原县", "g": "105.65 36.57" }
        ],
    };
})();
