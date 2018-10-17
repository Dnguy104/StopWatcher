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
	
}

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
		
		var output = document.getElementById('location');
		var mainBtn = document.getElementById('mainBtn');
		var pending = document.getElementById('pending');
		var checkbox = document.querySelector('input');

		function success(position) {
			views.location.latitude = position.coords.latitude.toFixed(4);
			views.location.longitude = position.coords.longitude.toFixed(4);
			
			defaultList(true);
		}

		function error() {
		    views.location.latitude = 'n/a';
			views.location.longitude = 'n/a';
			
			views.locationIsOn = 0;
			defaultList(false);
		}
		
		function defaultList(accept) {
			if (!this.initialized) {
				views.initialized = true;
				mainBtn.style.display = 'block';
				pending.style.display = 'none';
				checkbox.checked = accept;
			}
		}
		
		this.recoverData();
		this.displayTimes();
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
	initializeBtn: function() {
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
		
		var reset = function() {
			timeList.times = [];
			var endTime = watch.stop();
			toggleBtn.innerHTML = 'Start!';
			timer.textContent = '00h 00m 00.000s';
			this.displayTimes();
		}
		resetBtn.addEventListener('click', reset.bind(this));
		
		var check = function() {
			if (checkbox.checked) {
				this.initialized = false;
				this.initialize();
			}
			else {
				this.endWatchLocation(this.locationIsOn);
				this.locationIsOn = 0;
				checkbox.checked = false;
			}
		}
		checkbox.addEventListener('change', check.bind(this));
		
		
	},
	endWatchLocation: function() {
		if (this.locationIsOn) {
			navigator.geolocation.clearWatch(this.locationIsOn);
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
	}
};


var elem = {
	timer: document.getElementById('timer'),
	delay: 70
}
var watch = new Stopwatch(elem);

views.initialize();
views.initializeBtn();

