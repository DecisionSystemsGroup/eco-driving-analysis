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
		_rememberMeElement = options.rememberMeElement || _loginWrapper.find('.remember-me');
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
		if((window.localStorage.logged||window.sessionStorage.logged) && !isTokenExpired()){
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

	function isTokenExpired(){
		if(!window.localStorage.logged && !window.sessionStorage.logged){	//if there is no token return false
			return false;
		}

		var expirationDate = window.localStorage.tokenExpires || window.sessionStorage.tokenExpires,
			now = new Date();
		expirationDate = new Date(expirationDate);

		return (now>expirationDate);
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
			window.localStorage.tokenExpires = response.expires;
		}
		window.sessionStorage.logged = true;
		window.sessionStorage.token = response.token;
		window.sessionStorage.tokenExpires = response.expires;
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
		_failMsgElement.show().html('<i class="fa fa-lg fa-exclamation" aria-hidden="true"></i> ' + response.error);
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
