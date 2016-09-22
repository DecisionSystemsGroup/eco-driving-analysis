var login = (function(){	
	var _mediator;
	
	function setMediator(mediator){
		_mediator = mediator;
		_subscribe();
	}
	
	function _subscribe(){
		_mediator.on('login-submit', tryLogin);
		_mediator.on('login-success', _storeToken);
	};
	
	function isLogged() {
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
		for (var index in window.localStorage) {
			if (!window.localStorage.hasOwnProperty(index)) {
				continue;
			}
			window.sessionStorage[index] = window.localStorage[index];
		}
	}
	
	function logout() {
		localStorage.clear();
		sessionStorage.clear();
	}
	
	function tryLogin(data) {
		_mediator.trigger('login-try', data);
	}
	
	function _storeToken(response){
		if(response.rememberMe){
			window.localStorage.logged = true;
			window.localStorage.token = response.token;
		}
		window.sessionStorage.logged = true;
		window.sessionStorage.token = response.token;
		_mediator.trigger('login-finished');
	}
	
	return {
		setMediator: setMediator,
		isLogged: isLogged,
		logout: logout,
		tryLogin: tryLogin
	};
})();