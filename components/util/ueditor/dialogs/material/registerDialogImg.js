'use strict';
/**
 * Cretate by xuexiaoting 17-02-17
 * 素材库自定义模态窗
 */
UE.registerUI('dialog_material_img', function(editor, uiName) {
    editor.registerCommand(uiName, {
        execCommand:function(name, list, width, height){
            if(list.length == 0) return;
            var str = '';
            for(var i = 0; i<list.length; i++){
                str += '<img src="'+list[i].FILEPATH+'" width="'+width+'" height="'+height+'" />';
            }
            this.execCommand('inserthtml', str);
        }
    });
    //创建dialog
    var dialog = new UE.ui.Dialog({
        //指定弹出层中页面的路径，这里只能支持页面,因为跟addCustomizeDialog.js相同目录，所以无需加路径
        iframeUrl: 'components/util/ueditor/dialogs/material/material_dialog_img.html',
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
            onclick: function() {
                dialog.close(true);
            }
        }, {
            className: 'edui-cancelbutton',
            label: '取消',
            onclick: function() {
                dialog.close(false);
            }
        }]
    });

    var btn = new UE.ui.Button({
        name: '图片库',
        title: '图片库',
        //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -39px -39px;',
        onclick: function() {
            //渲染dialog
            dialog.render();
            dialog.open();
        }
    });

    return btn;
});