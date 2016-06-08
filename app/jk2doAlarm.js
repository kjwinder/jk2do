angular.module('jk2do').service('jk2doAlarm', function($q) {
	this.alarms = [];

	this.findAll = function(callback) {
		chrome.alarms.getAll(function(alarms) {
			console.log('All chrome.alarms: ', alarms);
			for (var i = 0; i < alarms.length; i++) {
				var alarm = alarms[i];
				console.log('Alarm i=' + i + ':', alarm);
				console.log('AUTO CLEARING ALARM: ', alarm);
				chrome.alarms.clear(alarm.name); //DEBUG - force alarms to clear to prevent endless popups
			}
		});
	}
	
	this.add = function(data) {
		var newAlarm = angular.copy(_defaultModels.alarm, {});
		var newId = this.alarms.length + 1;
		//angular.merge({}, newAlarm, data);
		angular.extend({}, newAlarm, data);
		chrome.alarms.create(data.name, {
			delayInMinutes: newAlarm.delayInMinutes
		});
		newAlarm['id'] = newId;
		this.alarms.push(newAlarm);
		return newAlarm;
		
	}
	
	this.remove = function(alarm) {
		//var alarmName = alarm.id + '-' + alarm.name;
		//chrome.alarms.clear(alarmName);
		chrome.alarms.clear(alarm.name);
		this.alarms.splice(this.alarms.indexOf(alarm), 1);
	}
	
	
	
});