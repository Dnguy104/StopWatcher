/*
	This is the function object for keeping the stopwatch time. It has 2 public facing
	functions, start and stop, and 4 private functions for calculating and formatting 
	elapsed time. 

	The Stopwatch function object constructor takes an object containing the DOM element 
	in which to print the elasped time and a interval time that specifies how often it is updated.
*/
function Stopwatch(elem) {
	/*
		elapsedTime - keeps the number of milliseconds that has passed since the
		initial time of start
		interval - keeps the id returned by setInterval() to be used in clearInterval()
		offset - keeps the time of the most recent update
		isOn - boolean flag that checks if stopwatch is on/off
	*/
	var elapsedTime = 0;
	var interval;
	var offset;
	this.isOn = false;
	
	//--------------------- private functions ------------------------
	
	/*
		- This function uses timer() to calculate the ammount of time that has passed
		since the most recent update() call, and add it to elapsedTime.
		- Update stopwatch DOM element.
	*/
	update = function() {
		if(this.isOn) {
			elapsedTime += timer();	
		}
		elem['timer'].textContent = format(elapsedTime);
	}
	
	/*
		- This function calculates the difference in time between offset and the current time.
		- Assigns current time to offset.
		- To be used in update() to calculate change in time.
	*/
	timer = function() {
		var now = new Date;
		var passedTime = now - offset;
		offset = now;
		
		return passedTime;
	}
	
	/*
		- This function takes an input of milliseconds and converts it to 
		hours, minutes, and seconds.
		- returns a string of hours, minutes, and seconds
	*/
	format = function(milliseconds) {
		var hours = Math.floor(milliseconds / 3600000).toString();
		var minutes = Math.floor((milliseconds % 3600000) / 60000).toString();
		var seconds = (((milliseconds % (3600000 * 60000)) / 1000) % 60).toFixed(3);
		
		if (hours.length < 2) hours = '0' + hours;
		if (minutes.length < 2) minutes = '0' + minutes;
		if (seconds.length < 6) seconds = '0' + seconds;

		return hours + 'h ' + minutes + 'm ' + seconds + 's' ;
	}
	
	/*
		- This function returns a string with the current time and time zone.
	*/
	currentTime = function() {
		var currTime = new Date;
		
		return currTime.toLocaleDateString() + ' ' + currTime.toTimeString();
	}
	
	//--------------------- public functions ------------------------
	
	/*
		- Takes (Date object) as input for starting initial time of the stopwatch.
		this function calls setInterval on the update() private function. 
		- Assign setInterval() id to interval to later call clearInterval(), and 
		set isOn flag to true
		- Update() will be called continuously at the interval used in the Stopwatch 
		function input.
		- Initializes offset to the date of initial time, and returns a string with
		the current time and timezone to be printed to the table.
	*/
	this.start = function(initialTime) {
		if (!this.isOn) {
			elapsedTime = 0;
			interval = setInterval(update.bind(this), elem['delay']);
			offset = new Date(initialTime);
			this.isOn = true;
			
			return currentTime();
		}
	}
	/*
		- This function ends the stop watch component.
		- Call clearInterval(), using interval id, to terminate the setInterval()
		and stop updating stopwatch.
		- Clear interval variable and set isOn flag to false
		- calls update() to print time to stopwatch one last time.
		- returns strings for the time/timezone at the stoptime, and total elapsed time.
	*/
	
	this.stop = function() {
		if (this.isOn) {
			clearInterval(interval);
			interval = null;
			this.isOn = false;
			update();
			
			return {currentTime: currentTime(), 
					stopwatchTime: format(elapsedTime)};
		}
	}
}

