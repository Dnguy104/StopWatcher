/*
	- Object to store table data with functions to change data in a specified row
	- Each row has an isCompleted flag that shows if it is fully completed
	- addData() - changes data (value) for a specific key (key) in a specific row (index)
	= complete() - changes isComplete flag when a row is completely filled
*/
var timeList = {
	//A list containing each row of the times table as an object
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
/*
	View object handles setup and rendering of the table
	-initialize() is called once when the app loads to setup everything.
		- first loads saved data from localStorage into the timeList object.
		- calls buttonListener() to setup button event listeners
		- calls recover data to restart timer if any of the past times are incomplete
		- calls findLocation() to enable GPS geolocation
		- displays table data
	-displayTimes() is called whenever a change is made to the table.
		- saves the current state of the TimeList.times to localStorage
		- uses DOM manipulation to display each index of timeList.times as a row
		to the table, but excludes the isComplete flag.
*/
var views = {
	initialize: function() {
		//load times table from localStorage if it exists. 
		var localS  = localStorage.getItem('times');
		if(localS) {
			 timeList.times = JSON.parse(localStorage.getItem('times'));
		}
		
		//call handlers to setup app
		handlers.buttonListener();
		handlers.recoverData();
		handlers.findLocation();
		
		//render timeList.times to table
		this.displayTimes();
	},
	displayTimes: function() {
		var timeTbl = document.getElementById('timeTbl');
		
		//store timeList.times to localStorage
		localStorage.setItem('times',JSON.stringify(timeList.times));
		
		
		//create table header
		timeTbl.innerHTML = `<tr>
								<th>Start Time</th>
								<th>Start Location</th>
								<th>Finished Time</th>
								<th>Finish Location</th>
								<th>Elapsed Time</th>
							</tr>`;			
		
		//create each row from timeList.times
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
	}
};

/*
	Handlers object contains functions for handling buttons, table data entry, and
	button, table and GPS setup
	- locationIsOn - location flag. When gps is enabled locationIsOn will contain the id 
	to terminate location sharing. When gps is disabled locationIsOn = 0;
	- initialized  initialization flag. Allow onetime use defaultList() function when
	findLocation() is called in views.initialized().
	- location - when gps is enabled location will store and constantly be updated by
	the geolocation api with latitude and longitude of the device.

*/
var handlers = {
	locationIsOn: 0,
	initialized: false,
	location: {
		latitude: '',
		longitude: ''
	},
	/*
		This function is called whenever the start button is clicked
		- it takes the start time as input
		- Creates a new index in timeList.times and adds start time and start location data
	*/
	start: function(time) {
		timeList.addRow(time);
		var newIndex = timeList.times.length - 1;
		timeList.addData(newIndex, 'startTime', time);
		timeList.addData(newIndex, 'startLocation', 'lat: ' + this.location.latitude
			+ '<br>' + 'long: ' + this.location.longitude);
		views.displayTimes();
	},
	/*
		This function is called whenever the stop button is clicked
		- it takes the stop time and elapsed time as input
		- stop time, elapsed time, and stop location data to the last index in timeList.times
	*/
	stop: function(time) {		
		var newIndex = timeList.times.length - 1;
		timeList.addData(newIndex, 'stopTime', time['currentTime']);
		timeList.addData(newIndex, 'stopLocation', 'lat: ' + this.location.latitude
			 + '<br>' + 'long: ' + this.location.longitude);
		timeList.addData(newIndex, 'elapsedTime', time['stopwatchTime']);
		
		timeList.complete(newIndex);
		views.displayTimes();
	},
	
	// this function clears timeList.times
	reset: function() {
		timeList.times = [];
		views.displayTimes();
	},
	
	/*
		This function is used onced in views.initialize()
		- If the most recent entry is incomplete, then it will start the stopwatch
		from the start time of the incompleted entry
	*/
	recoverData: function() {
		var toggleBtn = document.getElementById('toggle');
		
		for (let index = 0; index < timeList.times.length; index++) {
			var elem = timeList.times[index];
			
		    if (elem.isComplete == false) {
		    	if (elem.stopTime == '') {
		    		
		    		// starting the stopwatch from the start time of the incompleted entry
					var startTime = watch.start(new Date(elem['startTime']));
					toggleBtn.textContent = 'Finish';
					return;
				}
			
			}		
		}
	},
	
	/*
		This function is used onced in views.initialize()
		- sets up event listeners for start/stop button, reset button, gps checkbox
	*/
	buttonListener: function() {
		var toggleBtn = document.getElementById('toggle');
		var resetBtn = document.getElementById('reset');
		var timer = document.getElementById('timer');
		var checkbox = document.querySelector('input');
		
		
		toggleBtn.addEventListener('click', function() {
			//if the watch is not on, then clicking it will start the stopwatch 
			//calling handlers.start()
			if (!watch.isOn) {
				var startTime = watch.start(new Date);
				
				handlers.start(startTime);
				toggleBtn.innerHTML = 'Finish!';
			}
			else {
				//if the watch is on, then clicking it will stop the stopwatch 
				//calling handlers.stop()
				var endTime = watch.stop();

				handlers.stop(endTime);
				toggleBtn.innerHTML = 'Start!';
			}
		});		
		
		//clicking the reset button stops the stopwatch and clears timer
		resetBtn.addEventListener('click', function() {
			var endTime = watch.stop();
			
			handlers.reset();
			toggleBtn.innerHTML = 'Start!';
			timer.textContent = '00h 00m 00.000s';
		});
		
		//checkbox listener
		checkbox.addEventListener('change', function() {
			//if checkbox is checked then call findlocation()
			if (checkbox.checked) {
				handlers.findLocation();
			}
			else {
				//if checkbox is unchecked then disable geolocation
				handlers.endWatchLocation(this.locationIsOn);
			}
		});	
	},
	/*
		-Enables geolocation tracking. Called once in views.initialize() and whenever
		gps checkbox is checked
	*/
	findLocation: function() {
		var output = document.getElementById('gps');
		var mainBtn = document.getElementById('mainBtn');
		var pending = document.getElementById('pending');
		var checkbox = document.querySelector('input');

		/*
			-geelocation success callback. constanly stores latitude and longitude into
			handler.location.
			-
		*/
		function success(position) {
			this.location.latitude = position.coords.latitude.toFixed(4);
			this.location.longitude = position.coords.longitude.toFixed(4);
			if (!this.initialized) defaultList(true);
			output.innerHTML = '<p>GPS</p>';
		}
		/*
			-geelocation error callback. constanly stores n/a latitude and longitude into
			handler.location.
			- sets handlers.locationIsOn = 0, because accessing geolocation failed
		*/
		function error() {
		    this.location.latitude = 'n/a';
			this.location.longitude = 'n/a';
			
			this.locationIsOn = 0;
			if (!this.initialized) defaultList(false);
			output.innerHTML = '<p>GPS</p>';
		}
		
		/*
			a onetime function to be called when findLocation is called in views.initialize()
			since watchposition is an asynchronous function, only make start and reset buttons
			visible after user enables/disables gps
			-default list sets initialized = true, so defaultList() can only be called once
		*/
		function defaultList(accept) {
			this.initialized = true;
			mainBtn.style.display = 'block';
			pending.style.display = 'none';
			checkbox.checked = accept;
		}
		
		if (!navigator.geolocation){
			output.innerHTML = '<p>GPS is not supported</p>';
		    return;
		}
		
		//call geolocation api
		this.locationIsOn = navigator.geolocation.watchPosition(success.bind(this), error.bind(this));
		output.innerHTML = '<p>Loading...</p>';		
	},
	
	/*
		-This function terminates geolocation tracking
		-Called whenever gps checkbox is unchecked
	*/
	endWatchLocation: function() {
		if (this.locationIsOn) {
			navigator.geolocation.clearWatch(this.locationIsOn);
			this.location.latitude = 'n/a';
			this.location.longitude = 'n/a';
			this.locationIsOn = 0;
		}
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

//views.initialize is called once on page load
views.initialize();