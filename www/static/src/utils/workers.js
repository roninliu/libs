/*
 * @Author: ronin
 * @Date:   2016-07-27 23:10:57
 * @Last Modified by:   ronin
 * @Last Modified time: 2016-07-27 23:30:58
 */
(function(root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(factory);
	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.Workers = factory(root);
	};
}(this, function(root) {
	/**
	 * [fetchAPI 封装ajax]
	 * @param  {[object]} options
	 * options.url: 请求接口地址 [string]
	 * options.method: 请求类型，默认为GET [string]
	 * options.data: 请求参数 [object]
	 * options.success: 请求成功回调函数 [function]
	 * @return {[object]} [JSON Object]
	 */
	var fetchAPI = function(options) {
		var xhr = null;
		options = options || null;
		if (!options) {
			return false;
		}
		if (Object.prototype.toString.call(options.success) !== '[object Function]') {
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
					options.success(resultData);
				} else {
					var resultData = {
						code: 1000,
						msg: "XMLHttpRequest Error",
						data: xhr.status
					}
					options.success(resultData);
				}
			}
		};
	};


	self.addEventListener("message", function(event) {
		var _opts = event.data;
		fetchAPI({
			url: _opts.url,
			method: _opts.method,
			data: _opts.data,
			success: function(result) {
				self.postMessage(result);
			}
		})
	}, false);
}));