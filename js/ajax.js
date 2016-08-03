/**
 * @author liyuelong1020@gmail.com
 * @date 2016-03-29
 * @version 1.0.0
 * @description Ajax
 */

var ajax = (function(require, exports) {

    /**
     * @param {Object} object
     * @param {Function} callback
     * @return {undefined}
     * @description 遍历对象
     */
    var forEachIn = function(object, callback) {
        for(var key in object) {
            if(object.hasOwnProperty(key)){
                callback(key, object[key]);
            }
        }
    };

    /**
     * @param {Object} data
     * @return {String}
     * @description 转换查询字段
     */
    var getQueryStr = function(data) {
        var str = [];
        data = data || {};
        forEachIn(data, function(i, item) {
            str.push(encodeURIComponent(i) + '=' + encodeURIComponent(item));
        });
        return str.join('&');
    };

    /**
     * @param {String} url
     * @param {Object} data
     * @return {String}
     * @description 拼接 get 请求 url
     */
    var getQueryUrl = function(url, data) {
        var queryStr = getQueryStr(data);
        if(queryStr) {
            url = url.split('#')[0];
            if(/\?/ig.test(url)){
                return url + '&' + queryStr;
            } else {
                return url + '?' + queryStr;
            }
        } else {
            return url;
        }
    };

    /**
     * @param {options} param
     * @description XMLHttpRequest
     */
    var ajax = function(param) {

        var xhr = new XMLHttpRequest(), postData, timeoutTimer;

        // 是否支持 responseType
        var noSupportType = false;

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4){

                xhr.onreadystatechange = null;
                timeoutTimer && clearTimeout(timeoutTimer);

                if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    var data;
                    try {
                        data = xhr.response || xhr.responseText;
                    } catch (e) {
                        data = '';
                    }

                    if(noSupportType && param.dataType == 'json'){
                        data = JSON.parse(data);
                    }

                    param.success(data);
                } else {
                    param.error(xhr);
                }
            }
        };

        if(({}).toString.call(param.data) === '[object FormData]') {
            // 如果使用FormData提交数据
            param.type = 'POST';
            postData = param.data;
        } else if(String(param.type).toLowerCase() === 'post'){
            // 如果请求方式为 POST
            param.type = 'POST';
            postData = getQueryStr(param.data);
        } else {
            // 如果请求方式为 GET
            param.type = 'GET';
            param.url = getQueryUrl(param.url, param.data);
            postData = null;
        }

        if(param.dataType){
            try {
                xhr.responseType = param.dataType;
                if(!xhr.responseType || xhr.responseType != param.dataType){
                    noSupportType = true;
                }
            } catch (e) {
                noSupportType = true;
            }
        }

        xhr.open(param.type, param.url, !!param.async);

        // 请求超时
        param.timeout = Number(param.timeout) || 0;
        if(param.timeout && param.timeout > 0){
            try {
                xhr.timeout = param.timeout;
            } catch (e) {
                setTimeout(function() {
                    xhr.abort();
                }, param.timeout);
            }
        }

        forEachIn(param.header, function(name, value) {
            xhr.setRequestHeader(name, value);
        });
        param.beforeSend(xhr);

        xhr.send(postData);
    };

    /**
     * @param {options} param
     * @description jsonp
     */
    var jsonp = function(param) {
        var callback = param.jsonp || 'json_callback_' + Date.now(),
            script = document.createElement("script"),
            head = document.head || document.querySelector('head') || document.documentElement;

        var data = param.data || {};
        data['_'] = 'jsonp_' + Date.now();
        data['callback'] = callback;

        window[callback] = function(data) {
            window[callback] = null;
            param.success(data);
        };

        script.async = !!param.async;
        script.charset = 'utf-8';

        script.src = getQueryUrl(param.url, data);

        script.onload = script.onreadystatechange = function( _, isAbort ) {

            if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

                script.onload = script.onreadystatechange = null;

                if ( script.parentNode ) {
                    script.parentNode.removeChild( script );
                }

                script = null;
            } else {
                param.error();
            }
        };

        head.insertBefore(script, head.firstChild);
    };

    /**
     * @return {options}
     * @description Ajax 请求设置
     */
    var options = {
        type: 'GET',               // 请求类型
        url: '',                   // 请求url
        async: true,               // 默认异步请求
        timeout: null,             // 请求超时
        data: {},                  // 请求参数
        header: {                  // 默认头信息
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        dataType: '',              // 获取的数据类型
        jsonp: '',                 // jsonp
        beforeSend: function() {}, // 请求发送前回调
        success: function() {},    // 成功回调
        error: function() {}       // 失败回调
    };

    /**
     * @param {String} type
     * @param {String} url
     * @param {Object} data
     * @param {String} dataType
     * @param {String} jsonp
     * @param {Function} success
     * @param {Function} error
     * @description Ajax 请求
     */
    return function(option) {
        forEachIn(options, function(key, value) {
            if(!option[key]){
                option[key] = value;
            }
        });
        if(option.dataType === 'jsonp'){
            jsonp(option);
        } else {
            ajax(option);
        }
    }
})();
