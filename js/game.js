var camera, scene, renderer, clock;

var particleSystem;
var player;
var deltaTime;
var asteroids = [];

var leftArrow = 37;
var rightArrow = 39;
var upArrow = 38;
var maxPosition = 300;
var keys = [];
var info; 
var lastSecond;

function init() {
	info = document.getElementById("infoBlock");

	clock = new THREE.Clock(true);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 75;

	var light = new THREE.DirectionalLight(0xffffff);
	//var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	//light.position.set(1, -1, 1).normalize();
	light.position.set(0,0,1).normalize();
	scene.add(light);

	player = createPlayer();
	scene.add(player);
	for(var i = 0; i<4;i++){
		let asteroid = createAsteroid();
		asteroids.push(asteroid);
		scene.add(asteroid);
	}


	particleSystem = createParticleSystem();
	scene.add(particleSystem);
  
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
	setupControls();
	lastSecond = new Date().getSeconds();
	render();
}

var frameCount = 0;
function render() {
	frameCount++;
	var sec = new Date().getSeconds();
	if ( sec!=lastSecond ) {
		lastSecond = sec;
		
		info.innerText = `Width:${window.innerWidth},Height:${window.innerHeight} FPS:${frameCount}`;
		frameCount = 0;
	}
	renderer.render(scene, camera);
}

function createParticleSystem() {

	// The number of particles in a particle system is not easily changed.
	var particleCount = 2000;

	// Particles are just individual vertices in a geometry
	// Create the geometry that will hold all of the vertices
	var particles = new THREE.Geometry();

	var rangeX = 200;//window.innerWidth/2;
	var rangeY = 200;//window.innerHeight/2;
	for (var p = 0; p < particleCount; p++) {

		// This will create all the vertices in a range of -200 to 200 in all directions
		//var x = Math.random() * (maxPosition*2) - maxPosition;
		//var y = Math.random() * (maxPosition*2)  - maxPosition;
		var x = Math.random() * (rangeX*2) - rangeX;
		var y = Math.random() * (rangeY*2) - rangeY;
		var z = Math.random() * 200 - 200;

		// Create the vertex
		var particle = new THREE.Vector3(x, y, z);

		// Add the vertex to the geometry
		particles.vertices.push(particle);
	}

	var loader = new THREE.TextureLoader();
	loader.crossOrigin = 'anonymous';
	var texture = loader.load("https://s1.postimg.org/52wcsj4gpr/particle.png");
	console.log(texture.type);
	// Create the material that will be used to render each vertex of the geometry
	var particleMaterial = new THREE.PointsMaterial(
		{
			color: 0xffffff,
			size: 4,
			map: texture,
			blending: THREE.AdditiveBlending,
			transparent: true,
		});

	// Create the particle system
	var system = new THREE.Points(particles, particleMaterial);

	return system;
}
function createPlayer() {
	//   var geometry = new THREE.CubeGeometry(20, 10, 10);
	// 	var material = new THREE.MeshPhongMaterial({ color: 0x0033ff, specular: 0x555555, shininess: 30 });

	// 	var cubeMesh = new THREE.Mesh(geometry, material );
	// 	cubeMesh.position.z = 10;
	//   cubeMesh.rotation.x = .7;
	// 	return cubeMesh;
	var geometry = new THREE.ConeGeometry( 5, 15, 8 );
	//var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var material = new THREE.MeshPhongMaterial({ color: 0x0033ff, specular: 0x555555, shininess: 30 });
	var cone = new THREE.Mesh( geometry, material );
	cone.rotation.y = .5;
	cone.position.y = -20;
	return cone;
}

function getVelocity() {
  const defaultVelocity = 10;
  
  if (keys[upArrow])
    return defaultVelocity*4;
  
  return defaultVelocity;
}

function getRotation() {
  var rotation = 0;
  if (keys[leftArrow]) {
    rotation = .1;
  }
  if (keys[rightArrow])
    rotation = -0.1;
  return rotation;
}

function getHeading() {
  var heading = 0;
 
  if (keys[leftArrow]) {
    heading = 20;
  }
  if (keys[rightArrow])
    heading = -20;
  return heading;
}

// function animateParticles() {
// 	var verts = particleSystem.geometry.vertices;
// 	for (var i = 0; i < verts.length; i++) {
// 		var vert = verts[i];
// 		if (vert.y < -maxPosition) {
// 			vert.y = maxPosition;//Math.random() * 400 - 200;
//     	}
// 		if (vert.x < -maxPosition) {
// 			vert.x = maxPosition;
// 		}
// 		if (vert.x>maxPosition) {
// 			vert.x = -maxPosition;
// 		}
		
// 		//cubeMesh.rotation.y = getHeading();
		
// 		vert.y = vert.y - (getVelocity() * deltaTime);
// 		vert.x = vert.x + (getHeading() * deltaTime);
// 	}

// 	particleSystem.geometry.verticesNeedUpdate = true;
// }
function animateParticles() {
	var rangeX = 200;//window.innerWidth/2;
	var rangeY = 200;//window.innerHeight/2;
	var verts = particleSystem.geometry.vertices;
	for (var i = 0; i < verts.length; i++) {
		var vert = verts[i];
		if (vert.y < -rangeY) {
			vert.y = rangeY;//Math.random() * 400 - 200;
    	}
		if (vert.x < -rangeX) {
			vert.x = rangeX;
		}
		if (vert.x>rangeX) {
			vert.x = -rangeX;
		}
		
		//cubeMesh.rotation.y = getHeading();
		
		vert.y = vert.y - (getVelocity() * deltaTime);
		vert.x = vert.x + (getHeading() * deltaTime);
	}

	particleSystem.geometry.verticesNeedUpdate = true;
}
function animatePlayer() {
	player.rotation.y = getHeading() * deltaTime;
}

function animateEnemies() {
	for (var i = 0; i < asteroids.length; i++) {
		const asteroid = asteroids[i];
		if (i === 0) {
			asteroid.position.x = -40;
			asteroid.position.y = -40;
		}
		if (i === 1) {
			asteroid.position.x = -40;
			asteroid.position.y = 40;
		}
		if (i === 2) {
			asteroid.position.x = 40;
			asteroid.position.y = -40;
		}
		if (i === 3) {
			asteroid.position.x = 40;
			asteroid.position.y = 40;
		}
		// if (asteroid.position.y < -maxPosition) {
		// 	asteroid.position.y = maxPosition;//Math.random() * 400 - 200;
    // 	}
		// if (asteroid.position.x < -maxPosition) {
		// 	asteroid.position.x = maxPosition;
		// }
		// if (asteroid.position.x>maxPosition) {
		// 	asteroid.position.x = -maxPosition;
		// }
		
		// //cubeMesh.rotation.y = getHeading();
		
		// asteroid.position.y = asteroid.position.y - (getVelocity() * deltaTime);
		// asteroid.position.x = asteroid.position.x + (getHeading() * deltaTime);
	}
}

function animate() {
	deltaTime = clock.getDelta();

	animateParticles();
	animatePlayer();
	animateEnemies();
	render();
	requestAnimationFrame(animate);
}



function createAsteroid() {
	// var spriteMap = new THREE.TextureLoader().load( "sprite.png" );
	// var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
	// var sprite = new THREE.Sprite( spriteMaterial );
	// scene.add( sprite );

	// var onProgress = function ( xhr ) {
	// 	if ( xhr.lengthComputable ) {
	// 		var percentComplete = xhr.loaded / xhr.total * 100;
	// 		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	// 	}
	// };

	// var onError = function ( xhr ) { console.log("we had an error loading the model"); };

	// THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
	// var asteroid;


	// 	var objLoader = new THREE.OBJLoader();
	// 	//objLoader.setMaterials( materials );
	// 	objLoader.setPath( 'https://raw.githubusercontent.com/grriffin/assets/master/models/asteroids/' );
	// 	var asteroid = objLoader.load( 'asteroid1.obj', function ( object ) {
	// 		object.position.y = -20;
	// 		console.log("asteroid loaded", object.position.x, object.position.y, object.position.z);
	// 		var box = new THREE.Box3().setFromObject( object );
	// 		console.log( box.min, box.max, box.size() );
	// 	}, onProgress, onError );
	//asteroid.position.set(0, 0, -53);
	//return asteroid;
	var geometry = new THREE.SphereGeometry( 5, 15, 8 );
	var material = new THREE.MeshPhongMaterial({ color: 0x0033ff, specular: 0x555555, shininess: 30 });
	var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/AM1.jpg') } );
	var asteroid = new THREE.Mesh( geometry, material );
	asteroid.rotation.y = .5;
	asteroid.position.y = 30;
	asteroid.position.x = -30;
	return asteroid;
	// var geometry = new THREE.SphereGeometry( 5, 15, 8 );
	// var material = new THREE.MeshPhongMaterial({ color: 0x0033ff, specular: 0x555555, shininess: 30 });
	// var cone = new THREE.Mesh( geometry, material );
	// cone.rotation.y = .5;
	// cone.position.y = 0;
	// cone.position.x = -30;
	// return cone;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}



function setupControls() {
  window.onkeyup = function(e) {
    keys[e.keyCode]=false;
  }
  window.onkeydown = function(e) {
    keys[e.keyCode]=true;
    if (e.which>=37 && e.which<=39) {
      e.preventDefault();
      return false;
    }
    return true;
  }
}

init();
animate();

