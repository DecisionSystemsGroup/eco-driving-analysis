var login = (function(){
	var _trigger,
		_loginWrapper,
		_usernameElement,
		_passwordElement,
		_rememberMeElement,
		_failMsgElement,
		_submitElement,
		_logoutElement;

	function init(options){
		_trigger = options.mediator || app.trigger;
		
		_loginWrapper = options.wrapper || $('.login-wrapper');
		
		_usernameElement = options.usernameElement || _loginWrapper.find('.username');
		_passwordElement = options.passwordElement || _loginWrapper.find('.password');
		_rememberMeElement = options.rememberMeElement || _loginWrapper.find('.rememberMe');
		_failMsgElement = options.failMsgElement || _loginWrapper.find('.fail-msg');
		_submitElement = options.submitElement || _loginWrapper.find('.submit');
		_logoutElement = options.logoutElement || $('.logout');
		
		_fireEventListeners();
	}
	
	function _fireEventListeners(){
		_submitElement.on('click', function(){
			var data = _getFormData();
			_trigger('login-submit', data);
		});
		
		_loginWrapper.find('input').on('keypress', function (e){	//login with enter
			if (e.which == 13) {
				var data = _getFormData();
				_trigger('login-submit', data);
			}
		});
		
		_logoutElement.on('click', function(){
			_trigger('logout');
		});
	}
	
	function show(){
		_loginWrapper.show();
		_usernameElement.focus();
	}
	
	function hide(){
		_loginWrapper.hide();
	}
	
	function isLogged(){
		if(window.localStorage.logged||window.sessionStorage.logged){
			if(!window.sessionStorage.logged){	//If the sessionStorage.logged is not yet defined the token has been stored at the localStorage for persistent use.
				sessionStorage.clear();
				_copyLocalStorageToSessionStorage();
			}
			return true;
		}
		else{
			return false;
		}
	}

	function _copyLocalStorageToSessionStorage(){
		for (var index in window.localStorage){
			if (!window.localStorage.hasOwnProperty(index)){
				continue;
			}
			window.sessionStorage[index] = window.localStorage[index];
		}
	}

	function logout(){
		localStorage.clear();
		sessionStorage.clear();
	}

	function storeToken(response){
		if(response.rememberMe){
			window.localStorage.logged = true;
			window.localStorage.token = response.token;
		}
		window.sessionStorage.logged = true;
		window.sessionStorage.token = response.token;
		_trigger('login-finished');
	}

	function _getFormData(){
		return {
			username: _usernameElement.val(),
			password: _passwordElement.val(),
			rememberMe: _rememberMeElement.prop('checked')
		};
	}
	
	function resetLoginForm(){
		_usernameElement.val('');
		_passwordElement.val('');
		_failMsgElement.hide().text('');
	}

	function _displayLoginFailMSG(response){
		_failMsgElement.show().text(response.error);
	}

	return {
		init: init,
		show: show,
		hide: hide,
		isLogged: isLogged,
		logout: logout,
		storeToken: storeToken,
		resetLoginForm: resetLoginForm,
		authFailed: _displayLoginFailMSG
	};
})();