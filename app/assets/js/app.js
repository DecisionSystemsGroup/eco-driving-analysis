var app = (function(){
	
	var _appWrapper = $('#app-wrapper'),
		settings = {
			apiUrl: 'http://eco.srv.teiste.gr/api/v1',
			firstPanelId: 'trainee-info',
			debugging: true
		};
	
	function trigger(evt, data){
		if(settings.debugging){
			console.log("Event triggered: "+evt, data);
		}
		
		switch(evt){
			case 'login-submit':
				api.authenticate(data);
				break;
			case 'auth-success':
				login.storeToken(data);
				login.resetLoginForm(data);
				break;
			case 'auth-fail':
				login.authFailed(data);
				break;
			case 'login-finished':
				initPanels();
				showApp(data);
				break;
			case 'logout':
				reset();
				break;
			case 'trainee-info-submit':
				drivingSession.update('traineeInfo', data);
				hidePanels();
                showTripControls(1);    //show the controls for the first trip
				showTripsPanel();
				break;
		}
	}
	
	function init(){
		api.init({
			mediator: app.trigger,
			apiUrl: settings.apiUrl
		});
		
		login.init({
			mediator: app.trigger
		});
		
		drivingSession.init({
			mediator: app.trigger
		});
		
		if(!login.isLogged()){
			showLogin();
		} else {
			showApp();
			initPanels();
		}
		
		hideLoader();
		_fireEventListeners();
	}
	function _fireEventListeners(){
		$('#trainee-info-submit').on('click', function(){
			var form = $('#trainee-form'),
				data = {
					name: form.find('#trainee-name').val(),
					surname: form.find('#trainee-surname').val(),
					company: form.find('#trainee-company').val(),
					birthday: form.find('#trainee-birthday').val(),
					license: form.find('#trainee-license').val()
				};

			trigger('trainee-info-submit', data);
		});
	}
	
	function hideLoader(){
		$('.before-ready').hide();
		$('.after-ready').show();
	}
	
	function showLogin(){
		_appWrapper.hide();
		login.show();
	}

	function showApp(){
		login.hide();
		_appWrapper.show();
	}
	
	function initPanels(){
		var lastStep = drivingSession.lastStep();
        
		if( lastStep === false ){ //there are no data at all
			$('.app-panel#trainee-info').show();
		} else if( lastStep === true ){   //the session is complete
			$('.app-panel#results').show();
		} else if( lastStep === 'traineeInfo'){   //only the trainee data are stored
            showTripControls(1);
			$('.app-panel#trips-timestamps').show();
		} else if( lastStep.indexOf('trip') != -1 ){  //some of the trips are complete
            var tripId = lastStep.split('trip').pop();
            tripId = parseInt(tripId)+1;    //Show the next one
            showTripControls(tripId);
			$('.app-panel#trips-timestamps').show();
		}
	}
    
    function showTripControls(id){
        $('.trip-timestamps-container').hide().filter("[data-trip='" + id + "']").show();
    }
    
	function hidePanels(){
		$('.app-panel').hide();
	}

	function showTripsPanel(){
		$('.app-panel#trips-timestamps').show();
	}

	function reset(){
		login.logout();
		drivingSession.clear();
		showLogin();
	}
	
	return {
		trigger: trigger,
		init: init,
		reset: reset
	};
})();
