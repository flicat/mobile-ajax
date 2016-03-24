/**
 * @author liyuelong1020@gmail.com
 * @date 15-5-8 下午6:00
 * @version 1.0.0
 * @description Ajax
 */

var ajax = (function() {

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

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4){

                xhr.onreadystatechange = null;
                timeoutTimer && clearTimeout(timeoutTimer);

                if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    var data;
                    // 根据请求的数据类型转换数据
                    if(String(param.dataType).toLowerCase() === 'json'){
                        try {
                            data = JSON.parse(xhr.responseText);
                        } catch (e) {
                            data = {};
                        }
                    } else {
                        data = xhr.responseText;
                    }

                    param.success(data);
                } else {
                    param.error(xhr);
                }
            }
        };

        if(String(param.type).toLowerCase() === 'get'){
            // 如果请求方式为 GET
            param.type = 'GET';
            param.url = getQueryUrl(param.url, param.data);
            postData = null;
        } else {
            // 如果请求方式为 POST
            param.type = 'POST';
            postData = getQueryStr(param.data);
        }

        // 请求超时
        param.timeout = Number(param.timeout) || 0;

        xhr.open(param.type, param.url, !!param.async);

        forEachIn(param.header, function(name, value) {
            xhr.setRequestHeader(name, value);
        });
        xhr.send(postData);

        if(param.timeout && param.timeout > 0){
            timeoutTimer = setTimeout(function() {
                timeoutTimer = null;
                xhr.abort();
            }, param.timeout);
        }
    };

    /**
     * @param {options} param
     * @description jsonp
     */
    var jsonp = function(param) {
        var callback = param.jsonp || 'json_callback_' + (new Date() - 0),
            script = document.createElement("script"),
            head = document.head || document.querySelector('head') || document.documentElement;

        var data = param.data || {};
        data['_'] = 'jsonp_' + (new Date() - 0);
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
        dataType: 'json',          // 获取的数据类型
        jsonp: '',                 // jsonp
        success: function() {},    // 成功回调
        error: function() {}       // 失败回调
    };

    /**
     * @param {String} type
     * @param {String} url
     * @param {Boolean} async
     * @param {Number} timeout
     * @param {Object} data
     * @param {Object} header
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
