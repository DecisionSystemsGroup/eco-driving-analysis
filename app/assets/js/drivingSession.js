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
		_data = {
			traineeInfo: undefined,
			trip1:undefined,
			trip2:undefined,
			trip3:undefined
		};
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
		_loadFromStorage();	//reset object reference
	}

	function _loadFromStorage(){
		_data = JSON.parse(_storage.drivingSession);
	}
	
	//Returns false if the drivingSession is empty, true if it is complete or the last complete step
	function lastStep(){
		if( !_data.traineeInfo ){
			return false;
		} else if( !_data.trip1 ){
			return 'traineeInfo';
		} else if( !_data.trip2 ){
			return 'trip1';
		} else if( !_data.trip3 ){
			return 'trip2';
		} else {
			return true;
		}
	}
	
	return {
		init: init,
		isActive: isActive,
		clear: clear,
		getData: getData,
		update: update,
		lastStep: lastStep
	};
})();
