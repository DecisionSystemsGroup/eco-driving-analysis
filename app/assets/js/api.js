var api = (function(){
	var _trigger;
	var _apiUrl;
	
	function setMediator(mediator){
		_trigger = mediator;
	}
	
	function setApiUrl(apiUrl){
		_apiUrl = apiUrl;
	}

	function authenticate(data){
		$.ajax({
			type: 'GET',
			url: _apiUrl+"/authentication/",
			headers: {
				"Accept":"application/json"
			},
			data : {"username": data.username, "password": data.password},
			success: function (response){
				response.rememberMe = data.rememberMe;
				_trigger('auth-success', response);
			},
			error: function (response){
				_trigger('auth-fail', response.responseJSON);
			}
		});
	}

	return {
		setMediator: setMediator,
		setApiUrl: setApiUrl,
		authenticate: authenticate
	};
})();
