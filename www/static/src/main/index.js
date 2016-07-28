(function() {



	var MainModel = new Vue({
		el: "body",
		data: {},
		ready: function() {
			var s = WebDB.getAll("site");
			console.log(s);
		}
	})
}())