var api = (function(){
	var _mediator;
	var _apiUrl;
	
	function setMediator(mediator){
		_mediator = mediator;
		_subscribe();
	}
	
	function setApiUrl(apiUrl){
		_apiUrl = apiUrl;
	}

	function _subscribe(){
		_mediator.on('login-try', auth);
	}

	function auth(data){
		$.ajax({
			type: 'GET',
			url: _apiUrl+"/authentication/",
			headers: {
				"Accept":"application/json"
			},
			data : {"username": data.username, "password": data.password},
			success: function (response) {
				response.rememberMe = data.rememberMe;
				_mediator.trigger('login-success', response);
			},
			error: function (response) {
				_mediator.trigger('login-fail', response.responseJSON);
			}
		});
	}

	return {
		setMediator: setMediator,
		setApiUrl: setApiUrl,
		apiLogin: auth
	};
})();
