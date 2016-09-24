var app = (function(){	
	var _mediator,
		firstPanelId = 'trainee-info';
		
	function setMediator(mediator){
		_mediator = mediator;
		_subscribe();
	}
	
	function _subscribe(){
		_mediator.on('login-finished', _loginFinished);
	};
	
	function init(){
		if(!login.isLogged()) {
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
	}
	
	function initPanels(){
		$('.app-panel#'+firstPanelId).show();
	}

	function reset(){
		login.logout();
		showLogin();
	}
	
	function _loginFinished(){
		 showApp();
	}
	
	return {
		setMediator: setMediator,
		init: init,
		reset: reset
	};
})();
