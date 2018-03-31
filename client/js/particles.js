window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||function(f){window.setTimeout(f,1e3/60)}}();
 
	var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');
 
function BOOM(actualX,actualY) {
 
	// Shim with setTimeout fallback
 
	var laX = actualX;
	var laY = actualY;	
	var W = WIDTH;
	var H = HEIGHT;
	// Let's set our gravity
	var gravity = 0.8;
 
	// Time to write a neat constructor for our
	// particles.
	// Lets initialize a random color to use for
	// our particles and also define the particle
	// count.
	var particle_count = parseInt(6);
	var particles = [];
 
	var random_color = 'rgb(236,244,9)';
 
	function Particle() {
		this.radius = parseInt(2);
		this.x = actualX;
		this.y = actualY;
		this.timer = 0;
 
		this.color = random_color;
 
		// Random Initial Velocities
		this.vx = Math.random() * 10 - 4;
		// vy should be negative initially
		// then only will it move upwards first
		// and then later come downwards when our
		// gravity is added to it.
		this.vy = Math.random() * -14 - 2;
 
		// Finally, the function to draw
		// our particle
		this.remove = function() {
			delete particles[this];
		}
		
		this.draw = function() {
			
				ctx.fillStyle = this.color;
 
				ctx.beginPath();
	 
				ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
				ctx.fill();
	 
				ctx.closePath();
			
			
		};
	}
 
	// Now lets quickly create our particle
	// objects and store them in particles array
	for (var i = 0; i < particle_count; i++) {
		var particle = new Particle();
		particles.push(particle);
	}
 
	// Finally, writing down the code to animate!
	(function renderFrame() {
		requestAnimationFrame(renderFrame);
 
		// Clearing screen to prevent trails
		//ctx.clearRect(0, 0, W, H);
 
		particles.forEach(function(particle) {
 
			// The particles simply go upwards
			// It MUST come down, so lets apply gravity
			
			particle.timer++;
			if(particle.timer > 10) {
				particle.remove();
			}else {
				particle.vy += gravity;
 
				// Adding velocity to x and y axis
				particle.x += particle.vx;
				particle.y += particle.vy;
	 
				// We're almost done! All we need to do now
				// is to reposition the particles as soon
				// as they move off the canvas.
				// We'll also need to re-set the velocities
	 
				particle.draw();
			}
				
			
 
		});
	}());
 
};