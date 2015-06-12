手机版轻量级 ajax 请求插件
===========

**调用方法**：
ajax(param);
>
> @param {String} type                // 请求类型，默认为 GET
> @param {String} url                 // 请求url
> @param {Object} data                // 请求参数
> @param {String} dataType            // 获取的数据类型  默认json  json|jsonp
> @param {String} jsonp               // jsonp 回调函数名称 dataType 为 jsonp 生效
> @param {Function} success           // 成功回调
> @param {Function} error             // 失败回调