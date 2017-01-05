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
				"Accept": "application/json"
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

	function createDrivingSession(data){
		$.ajax({
			type: 'POST',
			url: _apiUrl+"/session/",
			headers: {
				"Accept": "application/json",
				"token": sessionStorage.token
			},
			data : data,
			success: function (response){
				_trigger('new-session-after');
				_trigger('new-session-success', response);
			},
			error: function (response){
				_trigger('new-session-after');
				_trigger('new-session-fail', response.responseJSON);
			}
		});
	}

	function getUserInfo(){
		$.ajax({
			type: 'GET',
			url: _apiUrl+"/user/",
			headers: {
				"Accept": "application/json",
				"token": sessionStorage.token
			},
			success: function (response){
				_trigger('user-info-returned', response);
			},
			error: function (response){
				_trigger('user-info-fail', response.responseJSON);
			}
		});
	}
	
	return {
		init: init,
		authenticate: authenticate,
		getUserInfo: getUserInfo,
		createDrivingSession: createDrivingSession
	};
})();
