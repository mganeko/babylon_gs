(async ()=>{

  const canvas = document.getElementById("renderCanvas"); // Get the canvas element
  const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
  const scale = 0.015;
  
  const createScene = async function () {
  
      const scene = new BABYLON.Scene(engine);

      const target = new BABYLON.Vector3(0, 0, 0);

      //const alpha =  3*Math.PI/2;
      //const beta = Math.PI/50;
      //const radius = 220*scale;
      //const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, scene);
 
      const alpha =  3*Math.PI/2;
      const beta = Math.PI/10;
      const radius = 150*scale; 
      const camera = new BABYLON.ArcRotateCamera("Camera", -1, 0.8, radius, target, scene);

      camera.attachControl(canvas, true);
  
      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.6;
  
      const gsMesh = await loadGs(scene);
      //prepareGizmo(gsMesh, scene);
  
  
      try {
          const xrHelper = await scene.createDefaultXRExperienceAsync();
          const featuresManager = xrHelper.baseExperience.featuresManager;
          featuresManager.enableFeature(BABYLON.WebXRFeatureName.POINTER_SELECTION, "stable", {
              xrInput: xrHelper.input,
              enablePointerSelectionOnAllControllers: true        
          });
  
  
          const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 400, height: 400});
  
          featuresManager.enableFeature(BABYLON.WebXRFeatureName.TELEPORTATION, "stable", {
              xrInput: xrHelper.input,
              floorMeshes: [ground],
              snapPositions: [new BABYLON.Vector3(2.4*3.5*scale, 0, -10*scale)],
          });
  
          featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", {
              xrInput: xrHelper.input,
              jointMeshes: {
                  disableDefaultHandMesh: true,
                  enablePhysics: true
              }
          });
  
          // --- session manager and camera --
          const sessionManager = new WebXRSessionManager(scene);
          const xrCamera = new WebXRCamera("wrCam", scene, sessionManager);
          xrCamera.setTransformationFromNonVRCamera();

  
      } catch (e) {
          console.log(e);
      }
  
  
      return scene;
  }
  
  
  const scene = await createScene();
  
  //scene.debugLayer.show();
  
  engine.runRenderLoop(function () {
      scene.render();
  });
  // Watch for browser/canvas resize events
  window.addEventListener("resize", function () {
      engine.resize();
  });
  
  async function loadGs(scene) {
    const dataURL = "data/nudle.cleaned.ply";
    // Gaussian Splatting
    var gs = new BABYLON.GaussianSplattingMesh("Halo", null, scene);
    await gs.loadFileAsync(dataURL);
    
    gs.position.y = 0.5; -0.5;
    //gs.scaling = new BABYLON.Vector3(4.0, 4.0, 4.0);

    return gs;
  }

  function getMeshSize(mesh) {
    const sizes = mesh.getHierarchyBoundingVectors();
    const size = {
      x: sizes.max.x - sizes.min.x,
      y: sizes.max.y - sizes.min.y,
      z: sizes.max.z - sizes.min.z
    };
    return size;
  }

  function prepareGizmo(mesh, scene) {
    const boundingBox = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(mesh); // 元のサイズ
    //boundingBox.scaling = new BABYLON.Vector3(2.0, 2.0, 2.0); // 拡大
    console.log("boundingbox:", boundingBox);
    console.log("mesh size:", getMeshSize(mesh));
    console.log("boundingbox size:", getMeshSize(boundingBox));

    // Create bounding box gizmo
    const utilLayer = new BABYLON.UtilityLayerRenderer(scene)
    utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
    const gizmo = new BABYLON.BoundingBoxGizmo(BABYLON.Color3.FromHexString("#0984e3"), utilLayer);
    gizmo.attachedMesh = boundingBox;

    // --- gizmo --- move ---
    // Create behaviors to drag and scale with pointers in VR
    const sixDofDragBehavior = new BABYLON.SixDofDragBehavior()
    boundingBox.addBehavior(sixDofDragBehavior)
    const multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior()
    boundingBox.addBehavior(multiPointerScaleBehavior);

    return gizmo;
  }
  
  
})()
