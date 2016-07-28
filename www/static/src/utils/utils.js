/*
 * @Author: ronin
 * @Date:   2016-07-27 23:21:42
 * @Last Modified by:   ronin
 * @Last Modified time: 2016-07-27 23:27:30
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
		root.Util = factory(root);
	};
}(this, function(root) {
	var isWorkerSupport = false;
	if (typeof(Worker) !== "undefined") {
		isWorkerSupport = true;
	} else {
		console.log("[Info]", "Worker not supported");
		isWorkerSupport = false;
	}
	/**
	 * [parseURIHandler 解析URL，可获得相关参数]
	 * @description [url中拼接的参数在params中]
	 * @param  {[string]} url [需要解析的url，参数默认url为浏览器地址]
	 * @return {[object]} [对象返回url中的相关参数信息]
	 */
	var parseURIHandler = function() {
		var url = window.location.href;
		var a = document.createElement('a');
		a.href = url;
		var urlObject = {
			source: url,
			protocol: a.protocol.replace(':', ''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: (function() {
				var ret = {},
					seg = a.search.replace(/^\?/, '').split('&'),
					len = seg.length,
					i = 0,
					s;
				for (; i < len; i++) {
					if (!seg[i]) {
						continue;
					}
					s = seg[i].split('=');
					ret[s[0]] = s[1];
				}
				return ret;
			})(),
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
			hash: a.hash.replace('#', ''),
			path: a.pathname.replace(/^([^\/])/, '/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
			segments: a.pathname.replace(/^\//, '').split('/')
		};
		return urlObject;
	};

	/**
	 * [getURIParamsHandler 获取URL中指定的参数]
	 * @param  {[string]} key [参数key]
	 * @return {[type]}     [description]
	 */
	var getURIParamsHandler = function(key) {
		var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
		var alls = window.location.search.substr(1).match(reg);
		if (alls !== null) {
			return decodeURI(alls[2]);
		} else {
			return null;
		}
	}



	/**
	 * [getPlatformHandler 获取设备平台]
	 * @return {[int]} [返回设备平台代号]
	 * [1:Andriod,2: IOS,3:PC,4:微信,5:未知,9:Android-微信,8:IOS-微信]
	 */
	var getPlatformHandler = function() {
		var _userAgent = navigator.userAgent.toLowerCase();
		if ((/mobile/i.test(_userAgent)) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(_userAgent))) {
			if (/iphone/i.test(_userAgent)) {
				if (/micromessenger/i.test(_userAgent)) {
					return 8;
				} else {
					return 2;
				}
			} else if (/android/i.test(_userAgent)) {
				if (/micromessenger/i.test(_userAgent)) {
					return 9;
				} else {
					return 1;
				}
			} else {
				return 5;
			}
		} else {
			return 3;
		}
	};



	/**
	 * [setCookie 设置cookie]
	 * @param {[string]} key   [cookie的name]
	 * @param {[string]} value [cookie的值]
	 * @param {[object]} options [可选][设置cookie相关的属性，expires：过期天数，path：路径，domain：域名，secure：是否是安全传输]
	 */
	var setCookie = function(key, value) {
		var options = null;
		if (arguments.length > 2) {
			options = arguments[2];
		} else {
			options = null;
		}
		if (key && value) {
			var cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);
			if (options !== null) {
				if (options.expires) {
					var times = new Date();
					times.setTime(times.getTime() + options.expires * 24 * 60 * 60 * 1000);
					cookie += ';expires=' + times.toGMTString();
				}
				if (options.path) {
					cookie += ';path=' + options.path;
				}
				if (options.domain) {
					cookie += ';domain=' + options.domain;
				}
				if (options.secure) {
					cookie += ';secure';
				}
			}
			document.cookie = cookie;
			return cookie;
		} else {
			return "";
		}
	};
	/**
	 * [getCookie 获取cookie]
	 * @param  {[string]} name [cookie的name]
	 * @return {[sting]}      [cookie的value]
	 */
	var getCookie = function(name) {
		var cookies = parseCookie();
		var current = decodeURIComponent(cookies[name]) || null;
		return current;
	};
	/**
	 * [removeCookie 删除cookie的值]
	 * @param  {[string]} name [cookie的关键字]
	 * @return {[void]}      [无]
	 */
	var removeCookie = function(name) {
		var cookies = parseCookie();
		if (cookies[name]) {
			document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
		}
	};
	/**
	 * [clearCookie 清除全部cookie]
	 * @return {[void]} [无]
	 */
	var clearCookie = function() {
		var cookies = parseCookie();
		for (var key in cookies) {
			document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
		}
	};
	/**
	 * [getAllCookies 获取当前全部cookie]
	 * @return {[void]} [无]
	 */
	var getAllCookies = function() {
		var cookies = parseCookie();
		var tmpCookies = {};
		for (var key in cookies) {
			tmpCookies[key] = decodeURIComponent(cookies[key]);
		}
		return tmpCookies;
	};

	/**
	 * [parseCookie 解析cookie，将cookie的字符串解析为Object]
	 * @return {[object]} [object的cookie]
	 */
	var parseCookie = function() {
		var cookies = {};
		if (document.cookie) {
			var tmpCookies = document.cookie.split(";");
			for (var key in tmpCookies) {
				var index = tmpCookies[key].indexOf("=");
				var name = tmpCookies[key].substr(0, index).replace(/\s+/g, "");
				var value = tmpCookies[key].substr(index + 1, tmpCookies[key].length).replace(/\s+/g, "");
				cookies[name] = value;
			}
		}
		return cookies;
	};

	/**
	 * [verifyMobileHandler 验证手机号]
	 * @param  {[string]} mobile [手机号码]
	 * @return {[boolean]}        [验证结果]
	 */
	var verifyMobileHandler = function(mobile) {
		var reg = /^1[3|4|5|7|8]\d{9}$/;
		if (!reg.test(mobile)) {
			console.log("错误的手机号码:", mobile);
			return false;
		} else {
			return true;
		}
	}


	/**
	 * [Md5Handler MD5字符串加密]
	 * @param  {[string]} input [输入的字符串]
	 * @param  {[string]} key   [加密密钥，可选,有key时，拼接规则key+input]
	 * @return {[string]}       [加密后的字符串]
	 */
	var Md5Handler = function(input) {
		var hexStr = '';
		if (arguments.length > 1) {
			hexStr = arguments[1].toString() + input.toString();
		} else {
			hexStr = input;
		}
		var md5Str = rstr2hex(raw_md5(hexStr));

		return md5Str;
	};

	var raw_md5 = function(s) {
		return rstr_md5(str2rstr_utf8(s));
	};

	var str2rstr_utf8 = function(input) {
		return unescape(encodeURIComponent(input));
	};

	var rstr_md5 = function(s) {
		return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	};
	var rstr2hex = function(input) {
		var hex_tab = '0123456789abcdef',
			output = '',
			x,
			i;
		for (i = 0; i < input.length; i += 1) {
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F) +
				hex_tab.charAt(x & 0x0F);
		}
		return output;
	};

	var rstr2binl = function(input) {
		var i,
			output = [];
		output[(input.length >> 2) - 1] = undefined;
		for (i = 0; i < output.length; i += 1) {
			output[i] = 0;
		}
		for (i = 0; i < input.length * 8; i += 8) {
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
		}
		return output;
	};
	var md5_ff = function(a, b, c, d, x, s, t) {
		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	};
	var md5_cmn = function(q, a, b, x, s, t) {
		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
	};
	var safe_add = function(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF),
			msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	};
	var bit_rol = function(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	};
	var md5_gg = function(a, b, c, d, x, s, t) {
		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	};
	var md5_hh = function(a, b, c, d, x, s, t) {
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	};
	var md5_ii = function(a, b, c, d, x, s, t) {
		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	};


	var binl_md5 = function(x, len) {
		x[len >> 5] |= 0x80 << (len % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;

		var i, olda, oldb, oldc, oldd,
			a = 1732584193,
			b = -271733879,
			c = -1732584194,
			d = 271733878;

		for (i = 0; i < x.length; i += 16) {
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;

			a = md5_ff(a, b, c, d, x[i], 7, -680876936);
			d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
			b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
			d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
			c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
			d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
			d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

			a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
			d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
			c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
			b = md5_gg(b, c, d, a, x[i], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
			d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
			c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
			d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
			c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
			a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
			d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
			c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
			b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
			d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
			b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
			d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
			c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
			d = md5_hh(d, a, b, c, x[i], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
			a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
			d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
			b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i], 6, -198630844);
			d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
			c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
			d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
			d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
			a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
			d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
			b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return [a, b, c, d];
	};

	var binl2rstr = function(input) {
		var i,
			output = '';
		for (i = 0; i < input.length * 32; i += 8) {
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
		}
		return output;
	};



	/**
	 * [fetchHandler 封装ajax]
	 * @param  {[object]} options
	 * options.url: 请求接口地址 [string]
	 * options.method: 请求类型，默认为GET [string]
	 * options.data: 请求参数 [object]
	 * options.success: 请求成功回调函数 [function]
	 * @return {[object]} [JSON Object]
	 */
	var fetchHandler = function(opts) {
		if (Object.prototype.toString.call(opts.success) !== '[object Function]') {
			console.log("[Error]", callback, "is not function")
			return false;
		} else {
			opts = opts || null;
			if (!opts) {
				console.log("[Error]", "option is required");
				return false;
			}
			if (!opts.url) {
				console.log("[Error]", "option url is required");
				return false;
			}
		}

		if (isWorkerSupport) {
			console.log(isWorkerSupport);
			/*未编译目录*/
			var worker = new Worker("/static/src/utils/workers.js");
			/*编译目录*/
			//var worker = new Worker("/static/build/utils/workers.js");
			worker.postMessage({
				url: opts.url,
				data: opts.data
			});
			worker.addEventListener("message", function(event) {
				opts.success(event.data)
			}, false);
		}
	}



	return {
		fetch: fetchHandler,
		parseURI: parseURIHandler,
		getPlatform: getPlatformHandler,
		Md5: Md5Handler,
		getCookie: getCookie,
		getAllCookies: getAllCookies,
		setCookie: setCookie,
		removeCookie: removeCookie,
		clearCookie: clearCookie,
		verifyMobile: verifyMobileHandler,
		getURIParams: getURIParamsHandler
	}
}));