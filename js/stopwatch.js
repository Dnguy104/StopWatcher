function Stopwatch(elem) {
	var time = 0;
	var interval;
	var offset;
	this.isOn = false;
	
	update = function() {
		if(this.isOn) {
			time += timer();	
		}
		elem['timer'].textContent = format(time);
	}
	
	timer = function() {
		var now = new Date;
		var passedTime = now - offset;
		offset = now;
		
		return passedTime;
	}
	
	format = function(milliseconds) {
		var hours = Math.floor(milliseconds / 3600000).toString();
		var minutes = Math.floor((milliseconds % 3600000) / 60000).toString();
		var seconds = (((milliseconds % (3600000 * 60000)) / 1000) % 60).toFixed(3);
		
		if (hours.length < 2) hours = '0' + hours;
		if (minutes.length < 2) minutes = '0' + minutes;
		if (seconds.length < 6) seconds = '0' + seconds;

		return hours + "h " + minutes + "m " + seconds + "s" ;
	}
	
	currentTime = function() {
		var currTime = new Date;
		
		return currTime.toLocaleDateString() + " " + currTime.toTimeString();
	}
	
	this.start = function(initialTime) {
		if (!this.isOn) {
			time = 0;
			interval = setInterval(update.bind(this),elem['delay']);
			offset = new Date(initialTime);
			this.isOn = true;
			
			return currentTime();
		}
	}
	
	this.stop = function() {
		if (this.isOn) {
			clearInterval(interval);
			interval = null;
			this.isOn = false;
			update();
			
			return {currentTime: currentTime(), 
					stopwatchTime: format(time)};
		}
	}
	
	
}

