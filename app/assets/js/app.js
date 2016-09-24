var app = (function(){	
	var firstPanelId = 'trainee-info';
		
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
				loginFinished(data);
				break;
		}
	}
	
	function init(){
		if(!login.isLogged()){
			showLogin();
		} else {
			showApp();
			initPanels();
		}
	}

	function showLogin(){
		$('#app-wrapper').hide();
		$('#login-wrapper').show();
		$('#login-username').focus();
	}

	function showApp(){
		$('#login-wrapper').hide();
		$('#app-wrapper').show();
		initPanels();
	}
	
	function initPanels(){
		$('.app-panel#'+firstPanelId).show();
	}

	function reset(){
		login.logout();
		showLogin();
	}
	
	function loginFinished(){
		 showApp();
	}
	
	return {
		trigger: trigger,
		init: init,
		reset: reset
	};
})();
