/*
 * @Author: ronin
 * @Date:   2016-07-27 23:10:57
 * @Last Modified by:   ronin
 * @Last Modified time: 2016-07-27 23:30:58
 */

'use strict';

/**
 * [fetchAPI 封装ajax]
 * @param  {[object]} options
 * options.url: 请求接口地址
 * options.method: 请求类型，默认为GET
 * options.data: 请求参数
 * callback: 请求成功回调函数
 * @return {[object]} [JSON Object]
 */
var fetchAPI = function(options, callback) {
	var xhr = null;
	options = options || null;
	if (!options) {
		return false;
	}
	options.method = options.method || "GET";
	options.data = options.data || {};
	options.url = options.url || null;
	if (!options.url) {
		return false;
	}
	if (XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		xhr = null;
	}
	var type = options.method.toUpperCase();
	var random = Math.random();
	if (typeof options.data == 'object') {
		var query = '';
		for (var key in options.data) {
			query += key + '=' + options.data[key] + '&';
		}
		options.data = query.replace(/&$/, '');
	}
	if (type == 'GET') {
		if (options.data) {
			xhr.open('GET', options.url + '?' + options.data, true);
		} else {
			xhr.open('GET', options.url + '?t=' + random, true);
		}
		xhr.send();
	} else if (type == 'POST') {
		xhr.open('POST', options.url, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(options.data);
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var resultData = xhr.responseText;
				try {
					resultData = JSON.parse(resultData);
				} catch (e) {
					resultData = {
						code: 1000,
						msg: "JSON Parse Error"
					};
				}
				callback(resultData);
			} else {
				var resultData = {
					code: 1000,
					msg: "XMLHttpRequest Error",
					data: xhr.status
				}
				callback(resultData);
			}
		}
	};
};



this.addEventListener("message", function(event) {
	console.log(event);
	fetchAPI(event.data, function(result) {
		console.log(result);
	})
}, true)