$(document).ready(function(){
	fireListeners();
});

function fireListeners(){
	$('#login-submit').on('click', function(){
		var data = getLoginData();
		app.trigger('login-submit', data);
	});
	
	$('#login-wrapper input').on('keypress', function (e){	//login with enter
		if (e.which == 13) {
			var data = getLoginData();
			app.trigger('login-submit', data);
		}
	});
	
	$('#logout').on('click', function(){
		app.reset();
	});
}