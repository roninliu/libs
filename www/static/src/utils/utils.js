/*
 * @Author: ronin
 * @Date:   2016-07-27 23:21:42
 * @Last Modified by:   ronin
 * @Last Modified time: 2016-07-27 23:27:30
 */

'use strict';

var worker = new Worker("/static/src/utils/workers.js");
worker.postMessage({
	url: "http://hz.huizhuang.com/common/index/getsite.do",
	data: {
		sid: 1
	}
});

worker.addEventListener("message", function(event) {
	console.log(event);
}, true);