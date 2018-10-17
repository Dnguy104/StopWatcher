/*
	- Object to store table data with functions to change data in a specified row
	- Each row has an isCompleted flag that shows if it is fully completed
	- addData() - changes data (value) for a specific key (key) in a specific row (index)
	= complete() - changes isComplete flag when a row is completely filled
*/
var timeList = {
	times: [],
	addRow: function(start){
		this.times.push({
			startTime: '',
			startLocation: '',
			stopTime: '',
			stopLocation: '',
			elapsedTime: '',
			isComplete: false
		});
	},
	addData: function(index, key, value) {
		this.times[index][key] = value;
	},
	complete: function(index) {
		this.times[index].isComplete = true;
	}	
};

var views = {
	locationIsOn: 0,
	initialized: false,
	location: {
		latitude: '',
		longitude: ''
	},
	initialize: function() {
		var localS  = localStorage.getItem('times');
		if(localS) {
			 timeList.times = JSON.parse(localStorage.getItem('times'));
		}
		localStorage.setItem('times',JSON.stringify(timeList.times));
		
		handlers.recoverData();
		this.displayTimes();
		
		var output = document.getElementById('location');
		var mainBtn = document.getElementById('mainBtn');
		var pending = document.getElementById('pending');
		var checkbox = document.querySelector('input');

		function success(position) {
			views.location.latitude = position.coords.latitude.toFixed(4);
			views.location.longitude = position.coords.longitude.toFixed(4);
			if (!this.initialized) defaultList(true);
		}

		function error() {
		    views.location.latitude = 'n/a';
			views.location.longitude = 'n/a';
			
			views.locationIsOn = 0;
			if (!this.initialized) defaultList(false);
		}
		
		function defaultList(accept) {
			views.initialized = true;
			mainBtn.style.display = 'block';
			pending.style.display = 'none';
			checkbox.checked = accept;
		}
		
		if (!this.locationIsOn) {
			if (!navigator.geolocation){
				output.innerHTML = '<p>Geolocation is not supported by your browser</p>';
			    return;
			}
			this.locationIsOn = navigator.geolocation.watchPosition(success.bind(this), error.bind(this));
		}

	},
	displayTimes: function() {
		var timeTbl = document.getElementById('timeTbl');
		localStorage.setItem('times',JSON.stringify(timeList.times));
		
		timeTbl.innerHTML = `<tr>
								<th>Start Time</th>
								<th>Start Location</th>
								<th>Finished Time</th>
								<th>Finish Location</th>
								<th>Elapsed Time</th>
							</tr>`;
		timeList.times.forEach(function(elem) {
			var entry = document.createElement('tr');
			for (var prop in elem) {
			    if (elem.hasOwnProperty(prop) && prop != 'isComplete') {
			    	var data = document.createElement('td');
			    	
			    	if (prop == 'startTime' || prop == 'stopTime') {
			    		data.innerHTML = elem[prop].slice(0,19) + '<br>'+ elem[prop].slice(19);
			    	} 
			    	else {
			    		data.innerHTML = elem[prop];
			    	}
					entry.appendChild(data);
					timeTbl.appendChild(entry);
				}
			}
				
		});
	},
	endWatchLocation: function() {
		if (this.locationIsOn) {
			navigator.geolocation.clearWatch(this.locationIsOn);
			views.location.latitude = 'n/a';
			views.location.longitude = 'n/a';
			views.locationIsOn = 0;
		}
	}
};

var handlers = {
	start: function(time) {
		timeList.addRow(time);
		var newIndex = timeList.times.length - 1;
		timeList.addData(newIndex, 'startTime', time);
		timeList.addData(newIndex, 'startLocation', 'lat: ' + views.location.latitude
			+ '<br>' + 'long: ' + views.location.longitude);
		views.displayTimes();
	},
	stop: function(time) {		
		var newIndex = timeList.times.length - 1;
		timeList.addData(newIndex, 'stopTime', time['currentTime']);
		timeList.addData(newIndex, 'stopLocation', 'lat: ' + views.location.latitude
			 + '<br>' + 'long: ' + views.location.longitude);
		timeList.addData(newIndex, 'elapsedTime', time['stopwatchTime']);
		
		timeList.complete(newIndex);
		views.displayTimes();
	},
	recoverData: function() {
		var toggleBtn = document.getElementById('toggle');
		
		for (let index = 0; index < timeList.times.length; index++) {
			var elem = timeList.times[index];
			
		    if (elem.isComplete == false) {
		    	if (elem.stopTime == '') {
					var startTime = watch.start(new Date(elem['startTime']));
					toggleBtn.textContent = 'Finish';
					return;
				}
			
			}		
		}
	},
	buttonListener: function() {
		var toggleBtn = document.getElementById('toggle');
		var resetBtn = document.getElementById('reset');
		var timer = document.getElementById('timer');
		var checkbox = document.querySelector('input');
		
		toggleBtn.addEventListener('click', function() {
			if (!watch.isOn) {
				var startTime = watch.start(new Date);
				
				handlers.start(startTime);
				toggleBtn.innerHTML = 'Finish!';
			}
			else {
				var endTime = watch.stop();

				handlers.stop(endTime);
				toggleBtn.innerHTML = 'Start!';
			}
		});		
		
		resetBtn.addEventListener('click', function() {
			timeList.times = [];
			var endTime = watch.stop();
			toggleBtn.innerHTML = 'Start!';
			timer.textContent = '00h 00m 00.000s';
			views.displayTimes();
		});

		checkbox.addEventListener('change', function() {
			if (checkbox.checked) {
				views.initialized = false;
				views.initialize();
			}
			else {
				views.endWatchLocation(this.locationIsOn);
				checkbox.checked = false;
			}
		});	
	},
	findLocation: function() {
		
	}
};

/*
	timer- DOM element for stopwatch
	delay- interval to update stopwatch, in milliseconds
*/
var elem = {
	timer: document.getElementById('timer'),
	delay: 70
}

//creating stopwatch object
var watch = new Stopwatch(elem);

views.initialize();
handlers.buttonListener();

