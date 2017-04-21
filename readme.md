手机版轻量级 ajax 请求插件
===========

**调用方法**：
ajax(param);
-
> - @param {String} type                // 请求类型，默认为 GET
> - @param {String} url                 // 请求url
> - @param {Number} timeout             // 请求超时
> - @param {Object} data                // 请求参数
> - @param {Boolean} cache              // 缓存回调方法，如果传递该参数，则ajax会缓存数据，如果本地有缓存数据则调用该方法
> - @param {Object} header              // 请求头信息
> - @param {String} dataType            // 获取的数据类型  arraybuffer|blob|document|json|text|jsonp|''
> - @param {String} jsonp               // jsonp 回调函数名称 dataType 为 jsonp 生效
> - @param {Function} beforeSend        // 请求发送前回调
> - @param {Function} success           // 成功回调，如果本地有缓存数据则不会调用该方法
> - @param {Function} error             // 失败回调
