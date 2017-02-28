(function() {
    angular
        .module('validation.rule', ['validation'])
        .config(['$validationProvider', function($validationProvider) {

            var expression = {
                required: function(value) {
                    // if(angular.isUndefined(value))return false;
                    return !!value;
                },
                url: function(value) {
                  if(!value)return true;
                   var URL_REGEXP =  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
                  return URL_REGEXP.test(value);
                },
                email:function(value){
                  if(!value)return true;
                  var EMAIL_REGEXP =  /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
                  return EMAIL_REGEXP.test(value);
                } ,
                number:function(value){
                  if(!value)return true;
                  var NUMBER_REGEXP = /^\d+$/;
                  return NUMBER_REGEXP.test(value);
                },
                minlength: function(value, scope, element, attrs, param) {
                  if(!value)return true;
                    return value.length >= param;
                },
                maxlength: function(value, scope, element, attrs, param) {
                  if(!value)return true;
                    return value.length <= param;
                },
                spechar: function(value) {
                  if(!value)return true;
                    var SPECIALCHAR_REGEXP = /[<>\/]/;
                    return !SPECIALCHAR_REGEXP.test(value);
                },
                custommonitorSpechar: function(value) {
                  if(!value)return true;
                    var CUSTOMMONITORSPECHAR_REGEXP = /[%<>\/]/;
                    return !CUSTOMMONITORSPECHAR_REGEXP.test(value);
                },
                idcard: function(value) {
                  if(!value)return true;
                    var IDCARD_REGEXP = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
                    return IDCARD_REGEXP.test(value);
                },
                telephone: function(value) {
                  if(!value)return true;
                    var TELPHONE_RETEXP = /(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7}/;
                    return TELPHONE_RETEXP.test(value);
                },
                mobilephone: function(value) {
                  if(!value)return true;
                    var MOBILEPHONE_REGEXP = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
                    return MOBILEPHONE_REGEXP.test(value);
                },
                englishAndNum:function(value){
                    if(!value)return true;
                    var ENGLISHANDNUM_RETEXP = /^[a-zA-Z][a-zA-Z0-9_]*$/;
                    return ENGLISHANDNUM_RETEXP.test(value);
                },
                ipconfig:function(value){
                     if(!value)return true;
                    var IPCONFIG_RETEXP = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
                    return IPCONFIG_RETEXP.test(value);
                },
                haschinese:function(value)
                {
                    if(!value)return true;
                    var HASCHINESE_RETEXP=  /^[^\u4e00-\u9fa5]*$/;
                    return HASCHINESE_RETEXP.test(value);
                },
                allchar:function(value)
                {
                    if(!value)return true;
                    var ALLCHAR_RETEXP=  /(?=[\x21-\x7e“”‘’、·？！（）【】]+)[^A-Za-z0-9]/;
                    return !ALLCHAR_RETEXP.test(value);
                },
                hasletter:function(value)
                {
                    if(!value)return true;
                    var NOLETTER_RETEXP=  /[A-Za-z]+/;
                    return !NOLETTER_RETEXP.test(value);
                },
                filepath:function(value)
                {
                    if(!value)return true;
                    var FILEPATH_RETEX=/^[A-Za-z]:(?:\\(?!\\)|[^\\/:*?“”‘’''""<>|+-.`~#%^&;])+$/;
                    return FILEPATH_RETEX.test(value);
                },
                password:function(value){
                    if(!value)return true;
                    var PASSWORD_RETEX=/(?!^[a-z]+$)(?!^[A-Z]+$)(?!^[0-9]+$)(?!^[·~!@#$%\^&*()_\-=+{}\[\]【】\\|:;'",.<>/?]+$)(?!^[^\x21-\x7e]+$)^.+$/;
                    return PASSWORD_RETEX.test(value);
                },
                newFolder:function(value){
                    if(!value)return true;
                    var NEWFOLDER_RETEXP=/^[~|\$|\.|_].*/;
                    return !NEWFOLDER_RETEXP.test(value);
                },
                numb:function(value){
                    if(!value)return true;
                    var NUMB_RETEXP=/^[-+]?\d*$/;
                    return !NUMB_RETEXP.test(value);
                }
            };

            var defaultMsg = {
                required: {
                    error: '这是必填项！',
                    success: 'It\'s Required'
                },
                url: {
                    error: 'url格式不正确！',
                    success: 'It\'s Url'
                },
                email: {
                    error: 'Email格式不正确！',
                    success: 'It\'s Email'
                },
                number: {
                    error: '只能填写正整数！',
                    success: 'It\'s Number'
                },
                minlength: {
                    error: '长度太短了！',
                    success: 'Long enough!'
                },
                maxlength: {
                    error: '长度太长了！',
                    success: 'Short enough!'
                },
                spechar: {
                    error: '不能包含特殊字符！',
                    success: ''
                },
                custommonitorSpechar: {
                    error: '不能包含特殊字符！',
                    success: ''
                },
                idcard: {
                    error: '身份证号码错误！',
                    success: ''
                },
                telephone: {
                    error: '固定电话格式错误！',
                    success: ''
                },
                mobilephone: {
                    error: '手机号码格式错误！',
                    success: ''
                },
                englishAndNum:{
                    error:'请输入以英文字母开头，并且只含有英文字母、数字以及下划线的名称',
                    success: ''
                },
                ipconfig:{
                    error:'请输入正确输入服务器地址.',
                    success:''
                },
                haschinese:{
                    error:"不能包含汉字",
                    success:""
                },
                allchar:{
                    error:"不能包含符号",
                    success:""
                },
                hasletter:{
                    error:"不能包含字母",
                    success:""
                },
                filepath:{
                    error:"请输入正确的文件存放路径",
                    success:""
                },
                password:{
                    error:"须包含大写字母、小写字母、数字、特殊字符（如：!、$、# 等）中的2种",
                    success:""
                },
                newFolder:{
                    error:"不能以~ 、. 、 _ 、 $ 开头",
                    success:""
                },
                numb:{
                    error:"只能填写整数！",
                    success:""
                }
            };
            $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
        }]);
}).call(this);
