var api = (function(){
	var _mediator;
	
	function setMediator(mediator){
		_mediator = mediator;
		_subscribe();
	}
	
	function _subscribe(){
		_mediator.on('login-try', auth);
	};
	
	function auth(data){
		var response = {
			token: 'someValue',
			rememberMe: data.rememberMe
		}
		_mediator.trigger('login-success', response);
	}
	
	return {
		setMediator: setMediator,
		apiLogin: auth
	};
})();