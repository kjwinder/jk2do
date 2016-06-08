function eventFire() {
	console.log('launching jkApp:jkBackground.js');
	chrome.app.window.create('index.html', {
		id: 'main',
		bounds: { 
			width: 500,
			height: 800
		},
		minWidth: 400,
		minHeight: 500/*,
		frame: 'none'*/
	});
}

function popupMessage(alarm, msg) {
	var message = 'GENERIC (FIXME) ALARM TEXT'; //TODO
	console.log(alarm);
	console.log(msg);
	chrome.notifications.create('reminder', {
		type: 'basic',
		iconUrl: 'images/2do.png',
		title: 'Hey! Listen!',
		message: alarm.name || message
	});
}

chrome.app.runtime.onLaunched.addListener(eventFire);

chrome.notifications.onClicked.addListener(function(notificationId) {
	eventFire();
	chrome.notifications.clear(notificationId, function() {});
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	popupMessage(alarm, 'TEST ALARM TEXT');
	console.log('background: Alarm!', alarm);
});