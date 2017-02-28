"use strict";
/*
    Cretate by CC 17-02-16
    注册素材库弹窗
 */
UE.registerUI('dialog_material',
    function(editor, uiName) {
        editor.registerCommand(uiName, {
            execCommand: function(name, data,width,height) {
                for (var i = 0; i < data.length; i++) {
                    var videoHtml = '<div> <iframe src="' + data[i].MAS[0].androidAppPlayURL + '" width="'+width+'" height="'+height+'" align="none" frameborder="0" allowfullscreen="true"></iframe></div>';
                    //editor 是编辑器实例
                    //向编辑器插入视频，用iframe包裹当做HTML插入
                    this.execCommand('insertHtml', videoHtml);
                }
            }
        });
        //创建dialog
        var dialog = new UE.ui.Dialog({
            //指定弹出层中页面的路径，这里只能支持页面,因为跟addCustomizeDialog.js相同目录，所以无需加路径
            iframeUrl: 'components/util/ueditor/dialogs/material/material_dialog.html',
            //需要指定当前的编辑器实例
            editor: editor,
            //指定dialog的名字
            name: uiName,
            //dialog的标题
            title: "选择素材",

            //指定dialog的外围样式
            cssRules: "width:710px;height:350px;",

            //如果给出了buttons就代表dialog有确定和取消
            buttons: [{
                className: 'edui-okbutton',
                label: '确定',
                onclick: function(data) {
                    dialog.close(true);
                }
            }, {
                className: 'edui-cancelbutton',
                label: '取消',
                onclick: function(data) {
                    dialog.close(false);
                }
            }]
        });

        //参考addCustomizeButton.js
        var btn = new UE.ui.Button({
            name: '音视频库',
            title: '音视频库',
            //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
            cssRules: 'background-position: -681px -39px;',
            onclick: function() {
                //渲染dialog
                dialog.render();
                dialog.open();
            }
        });

        return btn;
    }); /*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/
