$(document).ready(function(){
	hideLoader();
	login.setMediator(mediator);
	app.setMediator(mediator);
	api.setMediator(mediator);
});

function hideLoader(){
	$('.before-ready').hide();
	$('.after-ready').show(function(){
		app.init();
	});
}

var mediator = {
	_callbacks : [],
	
	trigger: function (evt, data){
		if(this._callbacks[evt]){	//check if there are any functions for this event
			this._callbacks[evt].forEach(function(cb){	//loop through the array and call the functions
				if(typeof cb === "function")
					cb(data);
			});
		}
	},
	
	on: function (evt, cb){
		if(!this._callbacks[evt] || !this._callbacks[evt].constructor === Array){	//check if the cell for this event exists and is an array
			this._callbacks[evt] = [];
		}
		this._callbacks[evt].push(cb);	//add the function for the event
	}
};