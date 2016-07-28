(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(factory);
	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.Monitor = factory(root);
	}
}(this, function(root) {
	var skey = "xxxx"; //加密密钥
	var version = Util.getCookie("version"); //版本号
	var appid = Util.getCookie("appid"); //应用ID
	var addTiming = function() {
		var params = {};
		if (root.performance) {
			var timgs = root.performance.timing;
			for (var key in timgs) {
				if (key !== "toJSON") {
					params[key] = timgs[key];
				}
			}
			return params;
		} else {
			return {};
		}

	}

	var addParamsUrl = function(param) {
		var obj = Util.parseURI();
		param.pageid = obj.host;
		param.pageid += obj.path;
		for (var key in obj.params) {
			param[key] = obj.params[key];
		}
		return param;
	}

	var addCookies = function(param) {
		var cookies = Util.getAllCookies();
		for (var key in cookies) {
			param[key] = cookies[key];
		}
		return param;
	}

	var addCVHandler = function(opt) {
		var timestamp = new Date().valueOf();
		var params = addCookies(addParamsUrl(addTiming()));
		params.stime = stime;
		params.etime = etime;
		params.platform = Util.getPlatform();
		params.appid = appid;
		params.version = version;
		params.tag = "CV2_MSITE";
		params.type = "2"
		params.os = Util.getPlatform();
		params.timestamp = timestamp;
		params.access_token = Util.Md5(timestamp, skey).slice(3, 10);
		var num = parseInt(Util.getCookie("num")) + 1;
		Util.setCookie("num", num, {
			expires: 1000,
			path: "/"
		});
		params.num = num;
		for (var i in opt) {
			params[i] = opt[i];
		}
		params.referrer = encodeURIComponent(document.referrer);
		reportHandler(params);
	}

	var addPVHandler = function() {
		var timestamp = new Date().valueOf();
		var params = addCookies(addParamsUrl(addTiming()));
		params.stime = stime;
		params.etime = etime;
		params.platform = Util.getPlatform();
		params.appid = appid;
		params.version = version;
		params.tag = "PV2_MSITE";
		params.type = "1"
		params.os = Util.getPlatform();
		params.timestamp = timestamp;
		params.access_token = Util.Md5(timestamp, skey).slice(3, 10);
		params.referrer = encodeURIComponent(document.referrer);
		reportHandler(params);
	}

	var reportHandler = function(params) {
		var env = parseInt(Util.getCookie("env"));
		var url = ''; //上报地址

		var i = 0;
		for (var key in params) {
			if (i === 0) {
				url += key + "=" + params[key];
			} else {
				url += "&" + key + "=" + params[key];
			}
			i++;
		}

		var img = new Image();
		img.src = url;
	};
	addPVHandler();
	return {
		addCV: addCVHandler
	}
}));