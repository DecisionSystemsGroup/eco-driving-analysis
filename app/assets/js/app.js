var app = (function(){
	
	var _appWrapper = $('#app-wrapper'),
		settings = {
			apiUrl: 'http://eco.srv.teiste.gr/api/v1',
			firstPanelId: 'trainee-info'
		};
	
	function trigger(evt, data){
		switch(evt){
			case 'login-submit':
				api.authenticate(data);
				break;
			case 'auth-success':
				login.storeToken(data);
				login.resetLoginForm(data);
				break;
			case 'auth-fail':
				login.authFailed(data);
				break;
			case 'login-finished':
				showApp(data);
				break;
			case 'logout':
				reset();
				break;
		}
	}
	
	function init(){
		var apiOptions = {
			mediator: app.trigger,
			apiUrl: settings.apiUrl
		};
		api.init(apiOptions);
		
		var loginOptions = {
			mediator: app.trigger
		};
		login.init(loginOptions);
		
		if(!login.isLogged()){
			showLogin();
		} else {
			showApp();
			initPanels();
		}
		
		hideLoader();
	}
	
	function hideLoader(){
		$('.before-ready').hide();
		$('.after-ready').show();
	}
	
	function showLogin(){
		_appWrapper.hide();
		login.show();
	}

	function showApp(){
		login.hide();
		_appWrapper.show();
		initPanels();
	}
	
	function initPanels(){
		$('.app-panel#'+settings.firstPanelId).show();
	}

	function reset(){
		login.logout();
		showLogin();
	}
	
	return {
		trigger: trigger,
		init: init,
		reset: reset
	};
})();
