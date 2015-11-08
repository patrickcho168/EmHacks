

app.set('view engine', 'ejs'); //omit

app.get('/browsequotes', function(request, response) {
	response.render('browse_quotes',{webpath:""});
})

app.post("/getquotes", function(request, response) {
	var search_params = request.body;

	// NOTE: 
	// des formats: anywhere
	// od formats: anytime, yyyy-mm, yyyy-mm-dd
	var webpath = 'http://api.skyscanner.net/apiservices/xd/browsequotes/v1.0/SG/USD/en-US/sfo' + '/' + search_params.des + '/' + search_params.od + '/anytime?apikey=ah473367287496555171637201591562&callback=cb';
	console.log("#############webpath is: " + webpath + "############");
	httprequest(webpath, function (error, response2, body2) {
	  if (!error && response.statusCode == 200) {
	    console.log(body2); // Show the HTML for the Google homepage.
	    response.render('browse_quotes',{webpath: webpath});
	  }
	})
});


/********************************/

/********************************/
// 404 not found
// app.use(route.notFound404);

app.listen(port);