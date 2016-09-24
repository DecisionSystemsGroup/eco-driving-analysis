$(document).ready(function(){
	hideLoader();
	login.setMediator(app.trigger);
	
	var apiOptions = {
		mediator: app.trigger,
		apiUrl: settings.apiUrl
	};
	api.init(apiOptions);
});

function hideLoader(){
	$('.before-ready').hide();
	$('.after-ready').show(function(){
		app.init();
	});
}
function getLoginData(){
	return {
		username: $('#login-username').val(),
		password: $('#login-password').val(),
		rememberMe: $('#login-remember-me').prop('checked')
	};
}
var settings = {
	apiUrl: 'http://eco.srv.teiste.gr/api/v1'
}
