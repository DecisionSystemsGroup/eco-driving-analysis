$(document).ready(function(){
	hideLoader();
	
	var apiOptions = {
		mediator: app.trigger,
		apiUrl: settings.apiUrl
	};
	api.init(apiOptions);
	
	var loginOptions = {
		mediator: app.trigger
	};
	login.init(loginOptions);
});

function hideLoader(){
	$('.before-ready').hide();
	$('.after-ready').show(function(){
		app.init();
	});
}

var settings = {
	apiUrl: 'http://eco.srv.teiste.gr/api/v1'
}
