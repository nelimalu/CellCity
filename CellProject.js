var canvas = document.querySelector('canvas');

canvas.width = 700;
canvas.height = 700;

var c = canvas.getContext('2d');
var frame = 0;
var vel = 6;
var open = false;
var mute = true;
var continuetalking = true;

var img = new Image();
img.src = 'imgs/george.png';

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

var walking = new sound('imgs/walkingstone.mp3');
var talking = new sound('imgs/talking.mp3');
var themesong = new sound('imgs/themesong.mp3');
themesong.sound.volume = 0.03;

function get_distance(x1, y1, x2, y2) {
	var x_diff = Math.abs(x1 - x2);
	var y_diff = Math.abs(y1 - y2);
	var dist = Math.sqrt(Math.pow(x_diff, 2) + Math.pow(y_diff, 2));
	return dist;
}

function parse_newlines(text) {
	var finaltext = "";
	var chars = 0;
	var words = text.split(' ');
	for (var i = 0; i < words.length; i++) {
		chars += words[i].length;
		if (chars > 32) {
			finaltext += '\n' + words[i];
			chars = 0;
			continue;
		}
		finaltext += ' ' + words[i];
	}
	console.log(finaltext);
	return finaltext;
}

function check_collision(x, y, xcompensation, ycompensation) {
	for (var i = 0; i < roads.length; i++) {
		if (x >= roads[i].x + (vel * xcompensation) &&
		    x <= roads[i].x + (vel * xcompensation) + roads[i].width &&
		    y >= roads[i].y + (vel * ycompensation) &&
		    y <= roads[i].y + (vel * ycompensation) + roads[i].height) {
		    	return true;
		}
	}
	return false;
}

function Road(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.wx = x;
	this.wy = y;
	this.width = width;
	this.height = height;

	this.draw = function() {
		c.strokeStyle = 'red';
		c.strokeRect(this.x, this.y, this.width, this.height);
	}

}

function Person(frames, label, name, labelloc, text) {
	this.frames = frames;
	this.frame = 1;
	this.x = frames[0].x;
	this.y = frames[0].y;
	this.open = false;
	this.label = label;
	this.name = name;
	this.text = text;
	this.labelloc = labelloc;
	this.printtext = [];
	this.resettext = [];
	this.printtextcounter = 0;
	this.row = 0;

	for (var i = 0; i < this.text.split('\n').length; i++) {
		this.printtext.push("");
		this.resettext.push("");
	}

	this.draw = function() {
		this.x = this.frames[0].x;
		this.y = this.frames[0].y;

		if (!this.open) {
			if (this.frame < this.frames.length) {
				if (frame % 120 == 0) {
					this.frame++;
				}
			}
			if (this.frame >= this.frames.length) {
				this.frame = 0;
			}

			this.frames[this.frame].draw();

			c.font = "20px Monospace";
			c.fillStyle = "white";
			c.textAlign = "center";
			c.fillText(this.label, this.x + this.frames[0].width * this.labelloc, this.y);

		} else {
			if (this.printtextcounter < this.text.length && frame % 2 == 0) {
				console.log(this.text.charAt(this.printtextcounter));
				if (this.text.charAt(this.printtextcounter) == '\n') {
					this.row++;
					if (!continuetalking) {
						this.printtextcounter++;
					}
				}
				if (continuetalking || this.printtextcounter == 0) {
					this.printtext[this.row] += this.text.charAt(this.printtextcounter);
					if (!mute) {
						talking.play();
					}
					this.printtextcounter++;
				}
				if (this.text.charAt(this.printtextcounter - 1) == '.' || this.text.charAt(this.printtextcounter - 1) == '!' || this.text.charAt(this.printtextcounter - 1) == '?') {
					continuetalking = false;
				}
			} else if (this.printtextcounter > this.text.length) {
				talking.stop();
			}

			c.fillStyle = "rgba(32,32,32,0.5)";
			c.fillRect(0, 0, canvas.width, canvas.height);
			c.fillStyle = "white";
			c.fillRect(50, 100, canvas.width - 100, canvas.height - 200);
			c.fillStyle = "black";
			c.fillRect(60, 110, canvas.width - 120, canvas.height - 220);

			c.font = "25px Monospace";
			c.fillStyle = "white";
			c.textAlign = "center";
			c.fillText(this.name, canvas.width / 2, 140);
			c.font = "10px Monospace";
			c.fillText("Press escape to exit", canvas.width / 2, 560);
			c.fillText("Press space to continue the dialogue", canvas.width / 2, 575);
			c.font = "20px Monospace";

			for (var i = 0; i <= this.row; i++) {
				c.fillText(this.printtext[i], canvas.width / 2, (i * 25) + 180);
			}
		}
	}
}

function Sprite(image, x, y, width, height, src_x, src_y, src_width, src_height) {
	// x, y, width, height is used to resize the image
	// for src things you put the actual size of the image

	this.image = new Image();
	this.image.src = image;
	this.x = x;
	this.y = y;
	this.wx = x;
	this.wy = y;
	this.width = width;
	this.height = height;
	this.src_x = src_x;
	this.src_y = src_y;
	this.src_width = src_width;
	this.src_height = src_height;

	this.draw = function() {
		c.drawImage(this.image, this.src_x, this.src_y, this.src_width, this.src_height, this.x, this.y, this.width, this.height);
	}

}


function Player(x, y) {
	this.x = x;
	this.y = y;
	this.width = 50;
	this.height = 50;
	this.moving = false;
	this.animationFrame = 0;
	this.pressed = [0, 0, 0, 0];
	this.facing = 0;

	this.draw = function() {
		if (this.moving) {
			if (!mute) {
				walking.play();
			}
			if (this.animationFrame < 4) {
				if (frame % 10 == 0) {
					this.animationFrame++;
				}
			} else {
				this.animationFrame = 0;
			}

			c.drawImage(img, this.facing, (this.animationFrame % 4) * 50, this.width, this.height, this.x, this.y + 2 * (this.animationFrame % 4), 75, 75);

		} else {
			c.drawImage(img, this.facing, 0, this.width, this.height, this.x, this.y, 75, 75);
			walking.stop();
		}

	}

	this.move = function() {

		/*
		this.x += this.pressed[0];
		this.y += this.pressed[2];
		this.x += this.pressed[1];
		this.y += this.pressed[3];
		*/

		this.moving = false;
		for (var i = 0; i < this.pressed.length; i++) {
			if (this.pressed[i] != 0) {
				this.moving = true;
			}
		}

		peopleimgs = [];
		for (var i = 0; i < people.length; i++) {
			for (var j = 0; j < people[i].frames.length; j++) {
				peopleimgs.push(people[i].frames[j]);
			}
		}

		var images = sprites.concat(roads).concat(peopleimgs);
		for (var i = 0; i < images.length; i++) {

			if (this.pressed[2] != 0 && check_collision(this.x + this.width / 2, this.y + this.height / 2, 0, 1)) {  // W key
				this.facing = "100";
				images[i].wy += vel;
			}
			if (this.pressed[3] != 0 && check_collision(this.x + this.width / 2, this.y + this.height / 2, 0, -1)) {  // S key
				this.facing = "0";
				images[i].wy -= vel;
			}
			if (this.pressed[1] != 0 && check_collision(this.x + this.width / 2, this.y + this.height / 2, -1, 0)) {  // D key
				this.facing = "150";
				images[i].wx -= vel;
			}
			if (this.pressed[0] != 0 && check_collision(this.x + this.width / 2, this.y + this.height / 2, 1, 0)) {  // A key
				this.facing = "50";
				images[i].wx += vel;
			}
		}

		for (var i = 0; i < images.length; i++) {
			images[i].x = images[i].wx;
			images[i].y = images[i].wy;
		}

	}
}

window.addEventListener("mousedown", function(event) {
	var rect = canvas.getBoundingClientRect();
	var x = event.x - rect.left;
	var y = event.y - rect.top;
	for (var i = 0; i < people.length; i++) {
		if (x < people[i].x + people[i].frames[0].width && x > people[i].x) {
			if (y < people[i].x + people[i].frames[0].height && y > people[i].y) {
				if (get_distance(people[i].x, people[i].y, player.x, player.y) < 150) {
					people[i].open = true;
					break;
				}
			}
		}
	}

});

window.addEventListener("keydown", function(event) {
	if (!open) {
		if (event.key == "w" || event.key == "ArrowUp") {  // W key
			player.pressed[2] = -player.vel;
		}

		if (event.key == "s" || event.key == "ArrowDown") {  // S key
			player.pressed[3] = player.vel;
		}

		if (event.key == "a" || event.key == "ArrowLeft") {  // A key
			player.pressed[0] = -player.vel;
		}

		if (event.key == "d" || event.key == "ArrowRight") {  // D key
			player.pressed[1] = player.vel;
		}
	} else if (event.key == 'Escape') {
		continuetalking = true;
		for (var i = 0; i < people.length; i++) {
			people[i].open = false;
			people[i].printtextcounter = 0;
			people[i].printtext = Object.assign([], people[i].resettext);
			people[i].row = 0;
			open = false;
		}
	}
	if (event.key == 'm') {
		mute = !mute;
		talking.stop();
		walking.stop();
		themesong.stop();
	}
	if (event.key == ' ') {
		continuetalking = true;
	}
});

window.addEventListener("keyup", function(event) {
	if (!open) {
		if (event.key == "w" || event.key == "ArrowUp") {
			player.pressed[2] = 0;
		}

		if (event.key == "s" || event.key == "ArrowDown") {
			player.pressed[3] = 0;
		}

		if (event.key == "a" || event.key == "ArrowLeft") {
			player.pressed[0] = 0;
		}

		if (event.key == "d" || event.key == "ArrowRight") {
			player.pressed[1] = 0;
		}
	}
});

// CENTER IS -295, -1110
var player = new Player(parseInt(canvas.width / 2) - 25, parseInt(canvas.height / 2) - 25);
var sprites = [
			   new Sprite('imgs/CitySquare.png', -1800, -2600, 3000, 3100, 0, 0, 500, 500),
			   new Sprite('imgs/looproad.png', -1800, -2600, 3000, 3000, 0, 0, 2500, 2500),

			   new Sprite('imgs/Ribosome.png', 800, -400, 354, 519, 0, 0, 236, 346),
			   new Sprite('imgs/Ribosome.png', 350, -400, 354, 519, 0, 0, 236, 346),
			   new Sprite('imgs/Ribosome.png', -150, -400, 354, 519, 0, 0, 236, 346),

			   new Sprite('imgs/post.png', -910, -500, 511, 633, 0, 0, 511, 633),
			   new Sprite('imgs/parkinglot.png', -910, 125, 512, 224, 0, 0, 512, 224),

			   new Sprite('imgs/recycling.png', -1520, -700, 1000, 750, 0, 0, 600, 500),

			   new Sprite('imgs/policestation.png', -1520, -200, 750, 680, 0, 0, 250, 220),

			   new Sprite('imgs/tollstation.png', -1200, -1000, 528, 420, 0, 0, 528, 420),

			   new Sprite('imgs/townhall.png', -605, -1500, 600, 648, 0, 0, 300, 324),

			   new Sprite('imgs/garbage.png', -1750, -2400, 600, 600, 0, 0, 800, 800),
			   new Sprite('imgs/garbage.png', -1150, -2400, 700, 700, 0, 0, 800, 800),
			   new Sprite('imgs/garbage.png', -1250, -1700, 400, 400, 0, 0, 800, 800),
			   new Sprite('imgs/garbage.png', -1750, -1800, 500, 500, 0, 0, 800, 800),

			   new Sprite('imgs/transformers.png', 350, -1000, 750, 750, 0, 185, 500, 500),

			   new Sprite('imgs/Wall.png', -1800, -5600, 3000, 3000, 0, 0, 1000, 1000),
			   new Sprite('imgs/vertwall.png', -1800, -2950, 3000, 3600, 0, 0, 1000, 1300),
			   new Sprite('imgs/vertwall.png', 1171, -2950, 3000, 3600, 0, 0, 1000, 1300),
			   new Sprite('imgs/Wall.png', -1800, -2250, 3000, 3000, 0, 0, 1000, 1000),

			   new Sprite('imgs/solarfield.png', 50, -2650, 900, 2000, 0, 0, 900, 2000),

			   new Sprite('imgs/parkinglot.png', -180, -2500, 512, 224, 0, 0, 512, 224),
			   new Sprite('imgs/hospital.png', -370, -2200, 900, 619, 0, 0, 1200, 919),

			   new Sprite('imgs/door.png', 958, -2850, 230, 250, 0, 0, 512, 512)
			   ];
var roads = [new Road(-430, 140, 1600, 200), // bottom horizontal
			 new Road(-430, -590, 240, 750), // bottom vertical
			 new Road(-860, -790, 1130, 200), // loop bottom
			 new Road(-860, -1680, 1130, 200), // loop top
			 new Road(-860, -1480, 240, 890), // loop left
			 new Road(30, -1490, 240, 900), // loop right
			 new Road(-430, -2400, 200, 730), // top vertical
			 new Road(-1775, -2600, 1600, 200), // top horizontal
			 new Road(30, -1240, 1110, 200), // right horizontal
			 new Road(950, -2600, 190, 1400), // right vertical
			 new Road(-1770, -1240, 1130, 200), // left horizontal
			 new Road(-1770, -1240, 220, 1570) // left vertical
			 ];
var people = [new Person([new Sprite('imgs/constructionworker.png', 200, 130, 144, 154, 0, 0, 1300, 1390),
						  new Sprite('imgs/constructionworkerup.png', 200, 130, 144, 154, 0, 0, 1300, 1390)],
						  "Ribosome", "The Factory (Ribosome)", 0.5, parse_newlines("Hey there! Welcome to the Ribosome factories! Here we work day and night to make sure our small town has enough protein to keep going. We get sent these huge trucks of RNA from the town hall and use them to make our proteins. What’s RNA? Oh, it stands for ribonucleic acid. It’s just DNA but is able to be moved around.")),
			  new Person([new Sprite('imgs/wine.png', -330, -820, 150, 150, 0, 0, 150, 150),
						  new Sprite('imgs/wineup.png', -330, -820, 150, 150, 0, 0, 150, 150)],
						  "Nucleus", "The Town Hall (Nucleus)", 0.18, parse_newlines("Ah, looks like an admirer has arrived. What’s your name? Oh, really? That’s wonderful. So what brings you here? What’s that building behind me? Well, since I am the all famous and lovable mayor of this town, I suppose I can spare some time out of my busy schedule to explain. Well, this is the Nucleus. It’s where the DNA is protected. We also make RNA and ship it off to the Endoplasmic Reticulum. On top of that, we also make ribosomes, which are one of the most valuable protein producers in the whole town! I mean, without it, this town wouldn’t even exist, would it?")),
			  new Person([new Sprite('imgs/doctor.png', -105, -1680, 129, 97, 0, 0, 259, 194),
						  new Sprite('imgs/doctorup.png', -105, -1680, 129, 97, 0, 0, 259, 194)],
						  "Smooth ER", "The Hospital (Smooth ER)", 0.18, parse_newlines("Oh, another visitor. If you have any questions, make it quick. I’ve only got 5 minutes break all week. What’s this building? You really are dumb, aren’t you. Well it’s the hospital, of course! What did you think it was, a ribosome factory? Here we work really hard to make lots of lipids, phospholipids, and steroids. We also detoxify the cell from a bunch of stuff like alcohol or metabolism stuff. Oh, that’s my bell. I have to get back to work.")),
			  new Person([new Sprite('imgs/mailman.png', -520, 90, 150, 150, 0, 0, 300, 300),
						  new Sprite('imgs/mailmanup.png', -520, 90, 150, 150, 0, 0, 300, 300)],
						  "Golgi Apparatus", "The Post Office (Golgi Apparatus)", 0.18, parse_newlines("Hi! Put your mail in the bin behind me. You don’t have mail? You just want to know what this building is? Well, that’s a first. This is the Post Office. Here we take materials from all over the city, like proteins or lipids, package them, and ship them off in vesicles to the cell membrane. Seems easy, right? Wrong. You don’t understand the pain I go through to run this place. I haven’t slept in six weeks. SIX WEEKS. DO YOU UNDERSTAND HOW LONG THAT IS. All I need from you is to cover one shift for me. Just one shift is all I ask.")),
			  new Person([new Sprite('imgs/engineer.png', 280, -700, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/engineerup.png', 280, -700, 125, 125, 0, 0, 300, 300)],
						  "Mitochondria", "Transformers (Mitochondria)", 0.3, parse_newlines("Who are you? I haven’t seen you around before. Oh, you’re new here? Well, would you care if I were to explain what this marvellous organelle next to me is? Perfect! This is probably the most important part of the town. We take that useless low voltage power coming from the solar field and make it actually useful, high voltage electricity that powers everything in the cell, including the nucleus. I like to call it ATP. Why ATP? I don’t know, it sounds cool.")),
			  new Person([new Sprite('imgs/janitor.png', -700, -1700, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/janitorup.png', -700, -1700, 125, 125, 0, 0, 300, 300)],
						  "Vacuole", "Scrap Yard (Vacuole)", 0.13, parse_newlines("Hey, what’s up? What's this junkyard behind me? Oh, it’s called the vacuole. It’s basically just all the unwanted stuff in this town, like rats or garbage. It’s nothing interesting really, apart from how insanely large it is. It takes up a quarter of the entire town. A whole quarter! I mean, do you even understand how much a quarter 100 micrometers is? A lot! I know!")),
			  new Person([new Sprite('imgs/soldier.png', 1100, 150, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/soldierup.png', 1100, 150, 125, 125, 0, 0, 300, 300)],
						  "Cell Wall", "Wall (Cell Wall)", 0.23, parse_newlines("Hiya! Welcome to the great town wall. You’ve probably seen parts of it before and wondered “Wow, what a magnificent structure! I wonder what it does!” I know I have! In my opinion, the wall is the most important part of the cell. It acts as a defense against extracellular things. It also holds the shape of our town, because it would be a real shame to lose our amazing square shape, wouldn’t it! And that’s about it. Yeah, this organelle doesn’t have a very cool job.")),
			  new Person([new Sprite('imgs/guard.png', 1050, -2600, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/guardup.png', 1050, -2600, 125, 125, 0, 0, 300, 300)],
						  "Cell Membrane", "Border Patrol (Cell Membrane)", 0.23, parse_newlines("*munch* mmm *loud swallow* frosted donuts are so good. Oh, *quickly swallows donut* uh, hi. I didn’t see you there. Wait. You aren’t in a vesicle! You’re not allowed to pass *stands up straight*! Oh, you’re just exploring? I guess I can answer a few questions. So this is the cell membrane. Here we just filter out the good things and the bad things from entering or leaving the cell. We’re made out of these cool things called lipids and proteins. I’m sure you’ve heard all about them.")),
			  new Person([new Sprite('imgs/policeman.png', -1520, 280, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/policemanup.png', -1520, 280, 125, 125, 0, 0, 300, 300)],
						  "Lysosome", "Police Station (Lysosome)", 0.23, parse_newlines('PUT YOUR HANDS IN THE AIR WHERE I CAN SEE THEM! Oh, nevermind, you’re not a virus. You got me excited, I thought you were going to be another evil victim ready for me to catch. You’re not even leftover cell parts. I can’t even eat you!')),
			  new Person([new Sprite('imgs/businessman.png', -1520, -400, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/businessmanup.png', -1520, -400, 125, 125, 0, 0, 300, 300)],
						  "Peroxisome", "Recycling Center (Peroxisome)", 0.23, parse_newlines('Welcome to the recycling center! Here we take care of the town by making sure it doesn’t overflow with garbage. We’ll rush into the cytoplasm and detoxify the surrounding area. It’s really worth seeing, only $4 dollars. Did I say 4 dollars? I meant $40. Yeah, you’re right. That’s still too low.')),
			  new Person([new Sprite('imgs/solarman.png', 300, -1250, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/solarmanup.png', 300, -1250, 125, 125, 0, 0, 300, 300)],
						  "Chloroplast", "Solar Field (Chloroplast)", 0.23, parse_newlines('Oh, uh hi. You want to know what this is? Uh, i- it’s the solar field. H- h- here we harvest the sun’s energy and turn it into electricity. It’s pretty simple. Oh, uh, also, I know you’re going to decline, but can you cover my shift tomorrow? I really want a break- actually, it’s okay. I’m probably boring you anyway.')),
			  new Person([new Sprite('imgs/roadman.png', -925, -750, 125, 125, 0, 0, 300, 300),
						  new Sprite('imgs/roadmanup.png', -925, -750, 125, 125, 0, 0, 300, 300)],
						  "Rough ER", "Roads (Rough ER)", 0.15, parse_newlines('You seem to have been using my lovely roads. I know, they’re pretty great, huh? I originally made these to make the ribosomes and nucleus connected, but now everyone’s set up shop nearby. And not a single piece of garbage is on the roads! Not a single bit! You must admit, it takes a lot to keep these roads clean.'))
			 ];

var images = sprites.concat(roads);
for (var i = 0; i < images.length; i++) {
	images[i].wy += 100;
}

function animate() {
	requestAnimationFrame(animate);
	c.clearRect(0, 0, innerWidth, innerHeight);
	c.fillStyle = "blueviolet";
	c.fillRect(0, 0, canvas.width, canvas.height);
	if (!mute) {
		themesong.play();
	}

	frame++;
	frame %= 60;

	player.move();
	for (var i = 0; i < sprites.length; i++) {
		sprites[i].draw();
	}

	for (var i = 0; i < people.length; i++) {
		people[i].draw();
		if (people[i].open) {
			open = true;
			player.pressed = [0, 0, 0, 0];
		}
	}

	if (!open) {
		player.draw();
	}

	/*
	for (var i = 0; i < roads.length; i++) {
		roads[i].draw();
	}
	*/

	// c.fillStyle = "rgba(0,191,255,0.15)";
	// c.fillRect(0, 0, canvas.width, canvas.height);

}
animate();
