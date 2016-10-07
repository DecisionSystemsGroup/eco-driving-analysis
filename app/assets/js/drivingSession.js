var drivingSession = (function(){
	var _trigger,
		_storage = window.localStorage,
		_data = {
			traineeInfo: undefined,
			trip1:undefined,
			trip2:undefined,
			trip3:undefined
		};
	
	function init(options){
		_trigger = options.mediator;
		
		if(isActive()){
			_loadFromStorage();
		}
	}
	
	function isActive(){
		return _storage.drivingSession?true:false;
	}
	
	function clear(){
		delete _storage.drivingSession;
		_trigger('session-cleared');
	}
	
	function getData(){
		return _data;
	}
	
	function update(key, val){
		_data[key] = val;
		_saveToStorage();
	}
	
	function _saveToStorage(){
		_storage.drivingSession = JSON.stringify(_data);
	}

	function _loadFromStorage(){
		_data = JSON.parse(_storage.drivingSession);
	}
	
	return {
		init: init,
		isActive: isActive,
		clear: clear,
		getData: getData,
		update: update
	};
})();
