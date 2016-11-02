var app = (function(){
	
	var _appWrapper = $('#app-wrapper'),
		settings = {
			apiUrl: 'http://eco.srv.teiste.gr/api/v1',
			firstPanelId: 'trainee-info',
			debugging: true
		},
        tempTrip = {
            start: undefined,
            stop: undefined
        },
		resultsChart = undefined,
		timerIntervalId;
	
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
			case 'trip-started':
				updateCurrentTrip(data);
				showTripStop(data);
				startTimer(data);
				break;
			case 'trip-stopped':
				updateCurrentTrip(data);
				stopTimer();
				break;
			case 'trip-complete':
				drivingSession.update('trip'+data.tripId, data.timestamps);
				if(data.tripId<3){
					showNextTrip(data)
				} else {
					hidePanels();
					showResultsPanel(true);
					api.createDrivingSession(drivingSession.getData());
				}
				break;
			case 'session-cancel':
				resetSession();
				break;
			case 'new-session-success':
				renderResultsSuccess(data);
				break;
			case 'new-session-fail':
				renderResultsFaill(data);
				break;
			case 'new-session-after':
				showResultsContainer();
				break;
			case 'before-reload-session-complete':
				drivingSession.clear();
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
		//trainee info
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
        
		//trip start
        $('.trip-controls-start>.btn').on('click', function(){
            var data = {
				tripId: $(this).closest('.trip-timestamps-container').data('trip'),
                start: getTimestamp()
            }
            trigger('trip-started', data);
        });
		
		//trip stop
        $('.trip-controls-stop>.btn').on('click', function(){
            var data = {
				tripId: $(this).closest('.trip-timestamps-container').data('trip'),
                stop: getTimestamp()
            }
            trigger('trip-stopped', data);
        });

		//session cancel
        $('#session-cancel').on('click', function(){
            trigger('session-cancel', {});
        });
	}
	
	function getTimestamp(){
		return Math.floor(new Date().getTime()/1000);
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
        $('.app-panel').hide();		

		if( lastStep === false ){ //there are no data at all
			$('.app-panel#trainee-info').show();
		} else if( lastStep === true ){   //the last session before refresh was complete
			trigger('before-reload-session-complete');
			$('.app-panel#trainee-info').show();
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
		resetTripPanels();
		showLogin();
		stopTimer();
	}

	function resetSession(){
		drivingSession.clear();
		resetTripPanels();
		stopTimer();
		initPanels();
	}
	
	function updateCurrentTrip(tripData){
		if(tripData.stop){
			tempTrip.stop = tripData.stop;
			
			var data = {
				tripId: tripData.tripId,
				timestamps: tempTrip
			}
			trigger('trip-complete', data);
		} else {
			tempTrip.start = tripData.start;
		}
	}
	
	function resetTripPanels(){
		var containers = $('.trip-timestamps-container');
		containers.find('.trip-timestamp-stop').text('00:00:00');
		containers.find('.trip-controls-stop').hide();
		containers.find('.trip-controls-start').show();
	}

	function showTripStop(tripData){
		var tripWrapper = $('.trip-timestamps-container[data-trip="'+tripData.tripId+'"]');
		tripWrapper.find('.trip-controls-start').hide();
		tripWrapper.find('.trip-controls-stop').fadeIn();
	}
	
	function showNextTrip(data){
		if(data.tripId<3){
			$('.trip-timestamps-container[data-trip="'+data.tripId+'"]').fadeOut(function(){
				$('.trip-timestamps-container[data-trip="'+(data.tripId+1)+'"]').fadeIn();
			});
		}
	}
	
	function showResultsPanel(loader){
		var resultsWrapper = $('.app-panel#results');
		resultsWrapper.find('.panel-body').children().hide();
		if(loader){
			resultsWrapper.find('.loader-container').show();
		} else {
			resultsWrapper.find('.results-container').show();
		}
		resultsWrapper.show();
	}
	
	function renderResultsSuccess(data){
		if(resultsChart !== undefined){
			resultsChart.destroy();
		}
		var chartData = {
			labels: ['Instructor', 'Trainee'],
			datasets: [{
				data: [data.results.instructor, data.results.trainee],
				backgroundColor:["#36A2EB", "#FF6384"],
				hoverBackgroundColor:["#36A2EB", "#FF6384"]
			}]
		};
		var ctx = document.getElementById('results-chart');
		resultsChart = new Chart(ctx,{
			type: 'doughnut',
			data: chartData,
			options: {
				title: {
					display: true,
					fontSize: 25,
					text: 'Some Title'
				},
				animation: {
					duration: 1500,
					animateScale: true,
					animateRotate: true
				}
			}
		});
	}
	
	function renderResultsFaill(data){
		alertify.error( data.error );
	}
	
	function showResultsContainer(){
		var resultsWrapper = $('.app-panel#results');
		resultsWrapper.find('.loader-container').hide();
		resultsWrapper.find('.results-container').show();
	}
	
	function startTimer(data){
		var timerWrapper = $("[data-trip='" + data.tripId + "'] .trip-timestamp-stop");
		timerIntervalId = setInterval(function(){
			updateTimer(data.start, timerWrapper);
		}, 1000);
	}

	function stopTimer(){
		clearInterval(timerIntervalId);
	}

	function updateTimer(start, el){
		el.text(secToHHMMSS( (Date.now()/1000 | 0) - start));
	}

	function secToHHMMSS(time){
		time = parseInt(time);	//potential bugs with <sec values
		//  |0 aka .floor()
		var hrs = (time / 3600) | 0;
		var mins = ((time % 3600) / 60) | 0;
		var secs = time % 60;

		return ( hrs<99?("00"+hrs).slice(-2):hrs ) +":"+ ( ("00"+mins).slice(-2) ) +":"+ ( ("00"+secs).slice(-2) );
	}

	return {
		trigger: trigger,
		init: init,
		reset: reset
	};
})();
