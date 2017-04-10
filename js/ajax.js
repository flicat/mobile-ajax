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

        var eachArrParam = function(i, item) {
            i += '[]';
            item.forEach(function(subItem) {
                if(Array.isArray(subItem)) {
                    eachArrParam(i, subItem);
                } else {
                    str.push(encodeURIComponent(i) + '=' + encodeURIComponent(subItem));
                }
            });
        };

        forEachIn(data, function(i, item) {
            if(Array.isArray(item)) {
                eachArrParam(i, item);
            } else {
                str.push(encodeURIComponent(i) + '=' + encodeURIComponent(item));
            }
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

    // 根据格式返回数据
    var getDataByType = function(data, type) {
        try{
            switch(String(type).toLowerCase()) {
                case 'script': return new Function(data)(); break;
                case 'json': return JSON.parse(data); break;
                default: return data;
            }
        } catch(e) {
            return data;
        }
    };

    // 根据参数和请求地址生成缓存key
    var getCacheKey = function(param) {
        var name = String(param.url);
        var key_arr = [];

        if(({}).toString.call(param.data) === '[object Object]'){
            forEachIn(param.data, function(key, value) {
                key_arr.push(key + '=' + String(value));
            });

            key_arr.sort();
        }

        return name + '?' + key_arr.join('&');
    };

    // 缓存方法
    var cache = (function() {
        var ls = localStorage,
            cache_name = '__ajax_cache__',
            cacheData = [];

        try{
            cacheData = JSON.parse(ls[cache_name]);
        } catch(e) {
            cacheData = [];
        }

        if(({}).toString.call(cacheData) !== '[object Array]') {
            cacheData = [];
        }

        var getData = function(id) {
            for(var i = 0, len = cacheData.length; i < len; i++){
                if(cacheData[i].id == id && cacheData[i].value){
                    return cacheData[i];
                }
            }
        };

        return {

            // 根据ajax参数返回缓存值
            get_cache: function(id) {
                var data = getData(id);
                return data ? data.value : '';
            },

            // 设置缓存值
            set_cache: function(id, value) {
                var data = getData(id);

                if(!data){
                    data = {
                        id: id
                    };
                    cacheData.push(data);
                }

                try{
                    data.value = JSON.stringify(value);
                    ls[cache_name] = JSON.stringify(cacheData);
                } catch(e) {
                    console.error(e);
                }
            }
        };
    })();

    /**
     * @param {options} param
     * @description XMLHttpRequest
     */
    var ajax = function(param) {

        var xhr = new XMLHttpRequest(), postData, timeoutTimer;

        // 是否支持 responseType
        var noSupportType = false;

        // 缓存id
        var cacheId = getCacheKey(param);

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

                    if(noSupportType){
                        data = getDataByType(data, param.dataType);
                    }

                    // 如果使用缓存则保存到缓存中
                    if(!!param.cache) {
                        cache.set_cache(cacheId, data);
                    }

                    if(!cacheData || !param.cache) {
                        param.success(data);
                    }

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

        // 如果有缓存则使用缓存
        if(!!param.cache) {
            var cacheData = getDataByType(cache.get_cache(cacheId), param.dataType);
            if(cacheData){
                setTimeout(function() {
                    param.success(cacheData);
                }, 0);
            }
        }

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
        cache: false,              // 是否使用缓存
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
     * @param {Boolean} cache
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
