var express = require('express');
var app = express();
var serv = require('http').Server(app);
var fs = require('fs');

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
serv.listen(server_port);
console.log('server started');

var SOCKET_LIST = {};

var WIDTH = 1000;
var HEIGHT = 600;
var GWIDTH = 3000;
var GHEIGHT = 1800;

var Entity = function(param) {
	var self = {
		x:500,
		y:300,
		spdX:0,
		spdY:0,
		id:"",
		map:"desert",
	}
	if(param) {
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y
		if(param.map)
			self.map = param.map;
		if(param.id)
			self.id = param.id;
	}
	
	self.update = function() {
		self.updatePosition();
		
	}
	self.updatePosition = function() {
		if(self.x > 0) {
			if(self.x < GWIDTH) {
				self.x += self.spdX;
			}else {
				self.x = GWIDTH - 1;
				self.spdX = -self.spdX;
				self.x += self.spdX;
			}
			
			
		}else {
			self.x = 1;
			self.spdX = -self.spdX;
			self.x += self.spdX;
		}
		
		
		
		if(self.y > 0) {
			if(self.y < GHEIGHT) {
				self.y += self.spdY;
			}else {
				self.y = GHEIGHT - 1;
				self.spdY = -self.spdY;
				self.y += self.spdY;
			}
			
		}else {
			self.y = 1;
			self.spdY = -self.spdY;
			self.y += self.spdY;
		}
		
	}
	self.getDistance = function(pt) {
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));	
	}
	
	return self;
}

// PLAYER BEGIN
var Player = function(param) {
	var self = Entity(param);
	
	self.pseudo = param.pseudo;
	self.number="" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.pressingBomb = false;
	self.mouseAngle = 0;
	self.maxSpd = 5;
	self.hp = 10;
	self.hpmax = 10;
	self.score = 0;
	self.canShoot = 0;
	self.canShootBomb = 0;
	self.fireRate = 20;
	self.fireRateBomb = 80;
	self.canons = 0;
	self.bulletVelocity = 10;
	self.bombRadius = 100;
	
	
	var super_update = self.update;
	
	self.update = function() {
		self.updateSpd();
		super_update();
		if(self.canShoot > 0) {
			self.canShoot--;
			
		}
		if(self.canShootBomb > 0) {
			self.canShootBomb--;
			
		}
		if(self.pressingAttack != false) {
			//console.log({x:self.x,y:self.y});
			if(self.canShoot == 0) {
				self.canShoot = parseInt(self.fireRate);
				var canonAngle = 0;
				for(var i =0; i <= self.canons; i++) {
					if(canonAngle > 0) {
						canonAngle = - canonAngle;
					}
					else {
						canonAngle = 20 * i;
					}
					
					
					self.shootBullet((self.mouseAngle + canonAngle), self.pressingAttack);
				}

					 
			}
				
			
		}
		if(self.pressingBomb != false) {
			//console.log({x:self.x,y:self.y});
			if(self.canShootBomb == 0) {
				self.canShootBomb = parseInt(self.fireRateBomb);
				self.shootBomb(self.mouseAngle, self.pressingAttack);
				

					 
			}
				
			
		}
	} 
	
	self.updateFireRate = function(value) {
		if(self.fireRate > 3)
			self.fireRate -= value;
		
		
	}
	
	self.shootBullet = function(angle, target) {		
		
		Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
			velocity:self.bulletVelocity
		});
		/*
		Target({
			parent:self.id,
			targetX:target.x,
			targetY:target.y,
		});
		*/
	}
	self.shootBomb = function(angle, target) {		
		
		Bomb({
			parent:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
			radius:self.bombRadius,
		});
		/*
		Target({
			parent:self.id,
			targetX:target.x,
			targetY:target.y,
		});
		*/
	}
	
	self.updateSpd = function() {
		
			if(self.pressingRight)
				self.spdX = self.maxSpd;
			else if (self.pressingLeft)
				self.spdX = -self.maxSpd;
			else
				self.spdX = 0;
			
			if(self.pressingUp)
				self.spdY = -self.maxSpd;
			else if(self.pressingDown)
				self.spdY = self.maxSpd;
			else
				self.spdY = 0;
		
		
		
		
	}
	
	self.getInitPack = function() {
		return {
			id:self.id,
			pseudo:self.pseudo,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			hpmax:self.hpmax,
			score:self.score,
			map:self.map,
			canShoot:self.canShoot,
			canShootBomb:self.canShootBomb,
		};
		
	}
	
	self.getUpdatePack = function() {
		return {
			id:self.id,
			pseudo:self.pseudo,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			score:self.score,
			canShoot:self.canShoot,
			canShootBomb:self.canShootBomb,
		};
		
	}
	
	Player.list[self.id] = self;
	initPack.player.push(self.getInitPack());
	return self;
}

Player.list = {};
Player.onConnect = function(socket, pseudo) {

	
	var player = Player({
		id:socket.id,
		pseudo: pseudo
	});
	
	socket.on('keyPress',function(data) {
		if(data.inputId === 'left') 
			player.pressingLeft = data.state;
		else if(data.inputId === 'right') 
			player.pressingRight = data.state;
		else if(data.inputId === 'up') 
			player.pressingUp = data.state;
		else if(data.inputId === 'down') 
			player.pressingDown = data.state;
		else if(data.inputId === 'attack') 
			player.pressingAttack = data.state;			
		else if(data.inputId === 'mouseAngle') 
			player.mouseAngle = data.state;
		else if(data.inputId === 'bomb') 
			player.pressingBomb = data.state;
		
	});

	socket.on('updateFireRate', function(data) {
		player.score -= 10;
		player.fireRate = data.value;
	});
	socket.on('updateCanons', function(data) {
		player.score -= 10;
		player.canons = data.value;
	});
	socket.on('updateBulletVelocity', function(data) {
		player.score -= 10;
		player.bulletVelocity = data.value;
	});
	socket.on('updateBombRadius', function(data) {
		player.score -= 10;
		player.bombRadius = data.value;
	});
	
	
	socket.emit('init', {
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
		bomb:Bomb.getAllInitPack(),
		target:Target.getAllInitPack(),
		food:Food.getAllInitPack(),
	})
}

Player.getAllInitPack = function() {
	var players = [];
	for(var i in Player.list) {
		players.push(Player.list[i].getInitPack());
	}
	return players;
	
}

Player.onDisconnet = function(socket) {
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}

Player.update = function() {
	var pack = [];
	for(var i in Player.list) {
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}

// BULLET BEGIN
var Bullet = function(param) {
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;
	self.spdX = Math.cos(param.angle/180*Math.PI) * param.velocity;
	self.spdY = Math.sin(param.angle/180*Math.PI) * param.velocity;
	self.target = param.target;
	self.parent = param.parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	
	self.update = function() {
		if(self.timer++ > 100) 
			self.toRemove = true;
		super_update();
		/*
		for (var i in Target.list) {
			var t = Target.list[i];
			if(self.getDistance(t) < 18) {
				self.toRemove = true;
				Target.list[i].toRemove= true;
			}
		}
		*/
		for (var i in Food.list) {
			var f = Food.list[i];
			if(self.getDistance(f) < 18) {
				self.toRemove = true;
				
				Food.list[i].hp -= 1;
				if(Food.list[i].hp <= 0) {
					Food.list[i].x = parseInt(getRandomInt(10,(GWIDTH-10)));
					Food.list[i].y = parseInt(getRandomInt(10,(GWIDTH-10)));
					Food.list[i].hp = Food.list[i].hpmax;
					var shooter = Player.list[self.parent];
					if(shooter) {
						shooter.score += 1;
						/*
						if(shooter.score == 50
							|| shooter.score == 100
							|| shooter.score == 300) {
							shooter.fireRate = 20;
						}
						shooter.updateFireRate(0.2);
						*/
					}
						
					
				}
			}
		}
		
			
		
		for (var i in Player.list) {
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id) {
				//handle collision faire varier les PV
				p.hp -=1;
				
				if(p.hp <=0) {
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += 1;
					p.hp = p.hpmax;
					p.x = parseInt(getRandomInt(10,(GWIDTH-10)));
					p.y = parseInt(getRandomInt(10,(GWIDTH-10)));
				}
				self.toRemove = true;
			}
		}
		
	}
	

	
	self.getInitPack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
			target:self.target,
		};
		
	}
	
	self.getUpdatePack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			target:self.target,
		};
		
	}
	
	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());	
	return self;
}
Bullet.list = {};

Bullet.update = function() {
	
	var pack = [];
	for(var i in Bullet.list) {
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove) {
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		}
		else {
			pack.push(bullet.getUpdatePack());
		}
		
	}
	return pack;
}

Bullet.getAllInitPack = function() {
	var bullets = [];
	for(var i in Bullet.list) {
		bullets.push(Bullet.list[i].getInitPack());
	}
	
	return bullets;
}


// BOMB BEGIN
var Bomb = function(param) {
	var self = Entity(param);
	self.id = Math.random();
	self.radius = param.radius;
	self.currentRadius = 0;
	self.target = param.target;
	self.parent = param.parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	
	self.update = function() {
		
		if(self.currentRadius < self.radius) {
			self.currentRadius += 3;
		}
		else {
			self.toRemove = true;
		}
		/*
		if(self.timer++ > 70) 
			self.toRemove = true;
			*/
		super_update();
		/*
		for (var i in Target.list) {
			var t = Target.list[i];
			if(self.getDistance(t) < 18) {
				self.toRemove = true;
				Target.list[i].toRemove= true;
			}
		}
		*/
		for (var i in Food.list) {
			var f = Food.list[i];
			if(self.getDistance(f) < self.currentRadius) {
				//self.toRemove = true;
				
				Food.list[i].hp -= 1;
				if(Food.list[i].hp <= 0) {
					Food.list[i].x = parseInt(getRandomInt(10,(GWIDTH-10)));
					Food.list[i].y = parseInt(getRandomInt(10,(GWIDTH-10)));
					Food.list[i].hp = Food.list[i].hpmax;
					var shooter = Player.list[self.parent];
					if(shooter) {
						shooter.score += 1;
						/*
						if(shooter.score == 50
							|| shooter.score == 100
							|| shooter.score == 300) {
							shooter.fireRate = 20;
						}
						shooter.updateFireRate(0.2);
						*/
					}
						
					
				}
			}
		}	
		
		for (var i in Player.list) {
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < self.currentRadius && self.parent !== p.id) {
				//handle collision faire varier les PV
				p.hp -=1;
				
				if(p.hp <=0) {
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += 1;
					p.hp = p.hpmax;
					p.x = parseInt(getRandomInt(10,(GWIDTH-10)));
					p.y = parseInt(getRandomInt(10,(GWIDTH-10)));
				}
				//self.toRemove = true;
			}
		}
		
	}
	

	
	self.getInitPack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
			target:self.target,
			radius:self.currentRadius,
		};
		
	}
	
	self.getUpdatePack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			target:self.target,
			radius:self.currentRadius,
		};
		
	}
	
	Bomb.list[self.id] = self;
	initPack.bomb.push(self.getInitPack());	
	return self;
}
Bomb.list = {};

Bomb.update = function() {
	
	var pack = [];
	for(var i in Bomb.list) {
		var bomb = Bomb.list[i];
		bomb.update();
		if(bomb.toRemove) {
			delete Bomb.list[i];
			removePack.bomb.push(bomb.id);
		}
		else {
			pack.push(bomb.getUpdatePack());
		}
		
	}
	return pack;
}

Bomb.getAllInitPack = function() {
	var bombs = [];
	for(var i in Bomb.list) {
		bombs.push(Bomb.list[i].getInitPack());
	}
	
	return bombs;
}

// TARGET BEGIN
var Target = function(param) {
	
	var self = Entity(param);
	
	self.parent = param.parent;
	self.id = Math.random();
	self.x = Player.list[self.parent].x + param.targetX -WIDTH/2;
	self.y = Player.list[self.parent].y + param.targetY -HEIGHT/2;
	self.maxSpd = 1;
	self.timer = 0;
	self.toRemove = false;

	console.log({x:self.x,y:self.y});
	var super_update = self.update;
	
	self.update = function() {
		if(self.timer++ > 110) 
			self.toRemove = true;
		
		super_update();
	}
	
	self.getInitPack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			par:self.parent,
		};
	}
	
	self.getUpdatePack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			par:self.parent,
		};
	}
	
	self.updateSpd = function() {
		if(Player.list[self.parent].pressingRight)
			self.spdX = -self.maxSpd;
		else if (Player.list[self.parent].pressingLeft)
			self.spdX = self.maxSpd;
		else
			self.spdX = 0;
		
		if(Player.list[self.parent].pressingUp)
			self.spdY = self.maxSpd;
		else if(Player.list[self.parent].pressingDown)
			self.spdY = -self.maxSpd;
		else
			self.spdY = 0;
		
		
	}
	Target.list[self.id] = self;
	initPack.target.push(self.getInitPack());
	return self;
}

Target.list = {};

Target.update = function() {
	
	var pack = [];
	for(var i in Target.list) {
		var target = Target.list[i];
		target.update();
		if(target.toRemove) {
			delete Target.list[i];
			removePack.target.push(target.id);
		}
		else {
			pack.push(target.getUpdatePack());
		}
		
	}
	return pack;
}

Target.getAllInitPack = function() {
	var targets = [];
	for(var i in Target.list) {
		targets.push(Target.list[i].getInitPack());
	}
	
	return targets;
}

// FOOD BEGIN
var Food = function(param) {
	
	var self = Entity(param);
	self.id = Math.random();
	self.toRemove = false;
	self.hp = param.hp;
	self.hpmax = param.hpmax;
	self.color = getRndColor();
	
	var turnSpdx = Math.random() < 0.5 ? -1 : 1;
	var turnSpdy = Math.random() < 0.5 ? -1 : 1;
	
	self.spdX = Math.random() * turnSpdx;
	self.spdY = Math.random() * turnSpdy;
	
	var super_update = self.update;
	
	self.update = function() {
		if(self.hp <= 0) {
			self.hp = self.hpmax;
			self.x=parseInt(getRandomInt(10,(GWIDTH-10)));
			self.y=parseInt(getRandomInt(10,(GHEIGHT - 10)));
			
		}
			
		super_update();
	}
	
	self.getInitPack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			hpmax:self.hpmax,
			color:self.color,
		};
	}
	
	self.getUpdatePack = function() {
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
		};
	}
	
	
	Food.list[self.id] = self;
	initPack.food.push(self.getInitPack());
	return self;
}

Food.list = {};

Food.update = function() {
	
	var pack = [];
	for(var i in Food.list) {
		var food = Food.list[i];
		food.update();
		if(food.toRemove) {
			delete Food.list[i];
			removePack.food.push(food.id);
		}
		else {
			pack.push(food.getUpdatePack());
		}
		
	}
	return pack;
}

Food.getAllInitPack = function() {
	var foods = [];
	for(var i in Food.list) {
		foods.push(Food.list[i].getInitPack());
	}
	
	return foods;
}

var DEBUG = true;

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket) {
	console.log('socket connection');
	
	socket.id = Math.random();
	
	SOCKET_LIST[socket.id] = socket;
	
	
	socket.on('signIn',function(data) {
		if(data.pseudo != '') {
			Player.onConnect(socket, data.pseudo);
			socket.emit('signInResponse', {success:true});
		}else {
			socket.emit('signInResponse', {success:false});
		}
		
		
	});
	
	
	socket.on('disconnect',function() {
		delete SOCKET_LIST[socket.id];
		Player.onDisconnet(socket);
		
	});
	
	socket.on('sendMsgServer',function(data) {
		var playerName = (""+ socket.id).slice(2,7);
		
		for(var i in SOCKET_LIST) {
			SOCKET_LIST[i].emit('addToChat',playerName+': '+data);
		}
	});
	
	socket.on('evalServer',function(data) {
		if(!DEBUG)
			return;
		
		var res = eval(data);
		socket.emit('evalAnswer', res);
	});

});



var initPack = {player:[], bullet:[], target:[], food:[]};
var removePack = {player:[], bullet:[], target:[], food:[]};


for(var i =0; i < 250; i++) {
	var hp = 1;
	Food({
		id:parseInt(Math.random()),
		x:parseInt(getRandomInt(10,(GWIDTH-10))),
		y:parseInt(getRandomInt(10,(GHEIGHT - 10))),
		hp:hp,
		hpmax:hp,
	});
}

setInterval(function() {
	
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
		bomb:Bomb.update(),
		target:Target.update(),
		food:Food.update(),
	}
	
	for(var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit('init', initPack);
		socket.emit('update', pack);
		socket.emit('remove', removePack);
	}
	
	initPack.player = [];
	initPack.bullet = [];
	initPack.bomb = [];
	initPack.target = [];
	initPack.food = [];
	removePack.player = [];
	removePack.bullet = [];
	removePack.bomb = [];
	removePack.target = [];
	removePack.food = [];
	
	
}, 1000/25);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRndColor() {
	var r = 255*Math.random()|0,
		g = 255*Math.random()|0,
		b = 255*Math.random()|0;
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}
