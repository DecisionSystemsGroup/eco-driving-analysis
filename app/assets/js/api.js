var api = (function(){
	var _trigger,
		_apiUrl;
	
	function init(options){
		_trigger = options.mediator;
		_apiUrl = options.apiUrl;
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
		init: init,
		authenticate: authenticate
	};
})();
