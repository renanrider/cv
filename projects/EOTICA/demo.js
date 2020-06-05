"use strict";

var THREECAMERA;
var threeStuffs;
const SIZE_P = 0.96;
const SIZE_M = 1.02;
const SIZE_G = 1.08;

// callback : launched if a face is detected or lost. TODO : add a cool particle effect WoW !
function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log('INFO in detect_callback() : DETECTED');
  } else {
    console.log('INFO in detect_callback() : LOST');
  }
}

// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec, index, box_size = '', box_color = '') {

  if (threeStuffs == null && spec != null) {
    threeStuffs = THREE.JeelizHelper.init(spec, detect_callback);
  }

  const loader = new THREE.TextureLoader();
  box_color = box_color.replace('#', '');
  /* box_color = parseInt('0x' + (box_color != '' ? box_color : '000000')); */
  //isColor = box_color.replace('#', '');

  var materials = [
    new THREE.MeshBasicMaterial({ map: loader.load('./glasses/' + index + '/' +box_color+ '/left.png'), transparent: true, opacity: 1 }), //left side 
    new THREE.MeshBasicMaterial({ map: loader.load('./glasses/' + index + '/' +box_color+ '/right.png'), transparent: true, opacity: 1 }), //right side
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 }), //top side - unused
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 }), //bottom side - unused
    new THREE.MeshBasicMaterial({ map: loader.load('./glasses/' + index + '/' +box_color+  '/front.png'), transparent: true, opacity: 1 }), //front side
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 }), //back side -unused
  ];

  while ( threeStuffs.faceObject!==undefined && threeStuffs.faceObject.children.length > 0) {
    threeStuffs.faceObject.remove(threeStuffs.faceObject.children[0]);
  }

  //Cube config
  const boxWidth = parseFloat((box_size != '' ? box_size : 1));
  // const boxHeight = parseFloat((box_size != '' ? box_size : 1));
  const boxHeight = boxWidth;
  const boxDepth = 1;
  const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);

  // In this cube the texture of the glasses will be applied
  const cube = new THREE.Mesh(geometry, materials);
  cube.frustumCulled = false;
  cube.scale.multiplyScalar(1.1); //1.1
  cube.position.setY(0.2); //move glasses a bit up 0.05
  cube.position.setZ(0.02);//move glasses a bit forward 0.25
  cube.rotation.x -= 0.10;
  window.zou = cube;

  // addDragEventListener(cube);
  threeStuffs.faceObject.add(cube);

  // CREATE A LIGHT
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  threeStuffs.scene.add(ambient)

  // var dirLight = new THREE.DirectionalLight(0xffffff);
  // dirLight.position.set(100, 1000, 100);

  // threeStuffs.scene.add(dirLight)
  if (THREECAMERA == null) {
    //CREATE THE CAMERA
    // THREECAMERA = THREE.JeelizHelper.create_camera();
    var fov = 5;
    var near = 0.1;
    var far = 100;
    var aspecRatio = spec.canvasElement.width / spec.canvasElement.height;
    THREECAMERA = new THREE.PerspectiveCamera(fov, aspecRatio, near, far);
  }
} // end init_threeScene()

// launched by body.onload():
function main(index) {
  JeelizResizer.size_canvas({
    canvasId: 'jeeFaceFilterCanvas',
    callback: function (isError, bestVideoSettings) {
      init_faceFilter(bestVideoSettings, index);
    }
  })
} //end main()
function resize() {
  JEEFACEFILTERAPI.resize();
  JEEFACEFILTERAPI.reset_inputTexture();
  THREE.JeelizHelper.update_camera(THREECAMERA);
}
function init_faceFilter(videoSettings, index) {
  JEEFACEFILTERAPI.init({
    followZRot: true,
    canvasId: 'jeeFaceFilterCanvas',
    NNCpath: './dist/', // root of NNC.json file
    maxFacesDetected: 1,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log('AN ERROR HAPPENS. ERR =', errCode);
        return;
      }

      var eyepiece_size = $("#eyepiece_size").val();
      eyepiece_size = eyepiece_size.replace('P', SIZE_P);
      eyepiece_size = eyepiece_size.replace('M', SIZE_M);
      eyepiece_size = eyepiece_size.replace('G', SIZE_G);
      var eyepiece_color = $("#eyepiece_color").val();

      console.log('INFO : JEEFACEFILTERAPI IS READY');
      init_threeScene(spec, index, eyepiece_size, eyepiece_color);
    }, //end callbackReady()

    //called at each render iteration (drawing loop) :
    callbackTrack: function (detectState) {
      THREE.JeelizHelper.render(detectState, THREECAMERA);
    } //end callbackTrack()
  }); //end JEEFACEFILTERAPI.init call
} // end main()
