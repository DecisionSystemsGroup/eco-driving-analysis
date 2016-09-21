$(document).ready(function(){
	fireListeners();
});

function fireListeners(){
	$('#login-submit').on('click', function(){
		data = {
			username: $('#login-username').val(),
			password: $('#login-password').val(),
			rememberMe: $('#login-remember-me').prop('checked')
		};
		mediator.trigger('login-submit', data);
	});
	
	$('#logout').on('click', function(){
		app.reset();
	});
}