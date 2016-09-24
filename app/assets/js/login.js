var login = (function(){	
	var _trigger;
	
	function setMediator(mediator){
		_trigger = mediator;
	}
	
	function isLogged(){
		if(window.localStorage.logged||window.sessionStorage.logged){
			if(!window.sessionStorage.logged){	//If the sessionStorage.logged is not yet defined the token has been stored at the localStorage for persistent use.
				sessionStorage.clear();
				copyLocalStorageToSessionStorage();
			}
			return true;
		}
		else{
			return false;
		}
	}
	
	function copyLocalStorageToSessionStorage(){
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
	
	function resetLoginForm(){
		$('#login-username').val('');
		$('#login-password').val('');
		$('#login-fail-msg').hide().text('');
	}
	
	function _displayLoginFailMSG(response){
		$('#login-fail-msg').show().text(response.error);
	}
	
	return {
		setMediator: setMediator,
		isLogged: isLogged,
		logout: logout,
		storeToken: storeToken,
		resetLoginForm: resetLoginForm,
		authFailed: _displayLoginFailMSG
	};
})();