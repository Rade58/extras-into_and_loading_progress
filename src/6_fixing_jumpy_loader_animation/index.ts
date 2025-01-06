import * as THREE from "three";

import GUI from "lil-gui";

import { gsap } from "gsap";

import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader, RGBELoader } from "three/examples/jsm/Addons.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";

import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";

import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import tintVertexShader from "./tint/vertex.glsl";
import tintFragmentShader from "./tint/fragment.glsl";

import displacmentVertexShader from "./displacement/vertex.glsl";
import displacmentFragmentShader from "./displacement/fragment.glsl";

import overlayVertexShader from "./overlay/vertex.glsl";
import overlayFragmentShader from "./overlay/fragment.glsl";

// Fixing loader animation

// too jumpy at the end

// The animation looks a little jumpy for two reasons
// - When we add meshes to the scene, materials, textures and things
//  like that get compiled and loaded to the GPU and it can take few
//  milliseconds
// - The bar didn't finished its animation because there is a 0.5s transition on it

// we will do this with setTimeout (in onLoaded)

// other solution would be to use gsap delayCallback

// ------------ gui -------------------
/**
 * @description Debug UI - lil-ui
 */
const gui = new GUI({
  width: 340,
  title: "Tweak It",
  closeFolders: false,
});

/**
 * @description gui parmeters
 */
const parameters = {
  //
  "rotate model": 0,
  // default is 1 I think
  "envMapIntensity for every material of model": 1,
  // backgroundBluriness: 0.2,
  backgroundBluriness: 0,
  // backgroundIntensity: 5,
  backgroundIntensity: 1,
};

const realisticRendering = gui.addFolder("Realistic Rendering");
realisticRendering.close();
const postProcessing = gui.addFolder("Post Processing");
postProcessing.close();

const overlayFolder = gui.addFolder("Overlay");

gui.addColor({ randomColor: "" }, "randomColor");

// -------------------------------------------------------------
// -------------------------------------------------------------

//------------ canvas settings -----------
/**
 * @description canvas settings
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// ----------------------------------------

const canvas: HTMLCanvasElement | null = document.querySelector("canvas.webgl");

if (canvas) {
  // -------------------------------------------------------------------
  // -------------------------------------------------------------------
  // -------------------------------------------------------------------
  // -------------------------------------------------------------------

  // ------- Scene
  const scene = new THREE.Scene();

  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------- Overlay --------------------------------------------
  // --------------------------------------------------------------

  // const overlayGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  // const overlayGeometry = new THREE.PlaneGeometry(1.9, 1.9, 1, 1);

  const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragmentShader,

    transparent: true,
    // we wil add uAlpha uniform
    uniforms: {
      uAlpha: {
        // value: 0.5
        value: 1,
      },
      // uTime: { value: 0 },
      // uColor: { value: new THREE.Color("#000000") },
    },
    // depthWrite: false,
    // depthTest: false,
  });

  const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);

  scene.add(overlay);

  overlayFolder
    .add(overlayMaterial.uniforms.uAlpha, "value")
    .min(0)
    .max(1)
    .step(0.01)
    .name("overlayAlpha")
    .onChange(() => {
      // I think I don't need this
      // overlayMaterial.needsUpdate = true;
    });

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // ---- loaders and loading manager -------

  const loading_bar: HTMLDivElement | null =
    document.querySelector(".loading-bar");

  /**
   * @description loaders and LoadingManager
   */

  const loadingManager = new THREE.LoadingManager(
    () => {
      // onLoad
      // this is the solution
      /* setTimeout(() => {
        if (loading_bar) {
          loading_bar.classList.add("ended");

          loading_bar.style.transform = "";
          gsap.to(overlayMaterial.uniforms.uAlpha, { value: 0, duration: 3 });
        }
      }, 500);
       */
      // but can be also done like this
      gsap.delayedCall(0.5, () => {
        if (loading_bar) {
          loading_bar.classList.add("ended");

          loading_bar.style.transform = "";
          gsap.to(overlayMaterial.uniforms.uAlpha, { value: 0, duration: 3 });
        }
      });

      //
    },
    /**
     *
     * @param url of the asset
     * @param loaded how much assets were loaded
     * @param total total number of assets to load
     */
    (url, loaded, total) => {
      // const progress = (100 * loaded) / total;
      // console.log(`progress: ${progress}%`);

      const progressRatio = loaded / total;
      // console.log(`progressRatio: ${progressRatio}`);

      if (loading_bar) {
        // like this
        // loading_bar.style.transform = `scaleX(${progressRatio})`;
        // or by using css custom property which I like more
        // above one would still work (we don't need to alter CSS for it to work)

        loading_bar.style.setProperty("--progress", `${progressRatio}`);

        /* if (loaded === total) {
          loading_bar.style.opacity = "0";
        } */
      }

      if (loaded === total) {
        console.log("All assets loaded");
      }
    },
    () => {
      // onError
      console.log("Error with loading (loading manager)");
    }
  );
  // we just pass manager in instatioations of loaders
  const gltfLoader = new GLTFLoader(loadingManager);

  const rgbeLoader = new RGBELoader(loadingManager);

  // const cubeTextureLoader = new THREE.CubeTextureLoader();
  // const textureLoader = new THREE.TextureLoader();

  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------

  scene.backgroundBlurriness = parameters.backgroundBluriness;
  scene.backgroundIntensity = parameters.backgroundIntensity;
  //
  realisticRendering
    .add(parameters, "backgroundBluriness")
    .min(0)
    .max(1)
    .step(0.01)
    .onChange((val: number) => {
      scene.backgroundBlurriness = val;
    });
  realisticRendering
    .add(parameters, "backgroundIntensity")
    .min(1)
    .max(10)
    .step(0.1)
    .onChange((val: number) => {
      scene.backgroundIntensity = val;
    });

  //

  // I revorked this function so I can
  // set envMap for materials of meshes that are part of model
  function setEnvironmentMapForMaterialsOfModel(envMap: THREE.DataTexture) {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (
          child.material instanceof THREE.MeshStandardMaterial &&
          !(child.geometry instanceof THREE.TorusKnotGeometry)
        ) {
          child.material.envMap = envMap;
          child.material.envMapIntensity =
            parameters["envMapIntensity for every material of model"];

          // shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      }
    });
  }

  realisticRendering
    .add(parameters, "envMapIntensity for every material of model")
    .min(1)
    .max(10)
    .step(0.001)
    .onChange(updateAllMaterials);

  /**
   * @description Update All Materials
   */
  function updateAllMaterials() {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (
          child.material instanceof THREE.MeshStandardMaterial &&
          !(child.geometry instanceof THREE.TorusKnotGeometry)
        ) {
          // we can now define setting intensity with
          // gui

          child.material.envMapIntensity =
            parameters["envMapIntensity for every material of model"];
          child.material.needsUpdate = true;
        }
      }
    });
  }

  // -------- Camera -------------------------------
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(4, 1, -4);
  scene.add(camera);

  //------------------------------------------------
  //------------------------------------------------
  //------------------------------------------------
  //------------------------------------------------
  // ----------    ENVIRONMENT MAP

  // we write this

  /**
   * @description HDR (RGBE) equirectangular
   */
  rgbeLoader.load(
    "/textures/environmentMaps/underpass/2k.hdr",
    (environmentMap) => {
      environmentMap.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = environmentMap;

      // gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
      // gltfLoader.load("/models/car/future_car.glb", (gltf) => {
      gltfLoader.load("/models/cyber_helmet/cyber_helmet.glb", (gltf) => {
        console.log("model loaded");
        gltf.scene.scale.setScalar(10);
        gltf.scene.position.y = -1;

        gui
          .add(parameters, "rotate model")
          .onChange((a: number) => {
            gltf.scene.rotation.y = Math.PI * a;
          })
          .min(0)
          .max(2);

        scene.add(gltf.scene);

        setEnvironmentMapForMaterialsOfModel(environmentMap);
      });
    }
    // I'll remove this for now since I don't need them
    /* () => {
      console.log("loading hdri progressing");
    },
    (err) => {
      console.log("HDRI not loaded");
      console.error(err);
    } */
  );
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------

  // ----------------------------------------------
  // ----------------------------------------------
  // Meshes, Geometries, Materials
  // ----------------------------------------------
  // ----------------------------------------------

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // ------------------------- LIGHTS ----------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  /**
   * @description Directional light
   */
  const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
  directionalLight.position.set(-4, 6.5, 2.5);
  scene.add(directionalLight);

  // add this before adding helper
  directionalLight.shadow.camera.far = 15;

  directionalLight.shadow.mapSize.set(1024, 1024);

  const directionalLightCameraHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera
  );

  directionalLight.castShadow = true;

  directionalLight.target.position.set(0, 2, 0);
  directionalLight.target.updateWorldMatrix(true, true);

  directionalLightCameraHelper.visible = false;

  scene.add(directionalLightCameraHelper);

  realisticRendering.add(directionalLight, "castShadow");

  realisticRendering
    .add(directionalLight, "intensity")
    .min(0)
    .max(10)
    .step(0.001)
    .name("directLightIntensity");
  realisticRendering
    .add(directionalLight.position, "x")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("directLighX");
  realisticRendering
    .add(directionalLight.position, "y")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("directLighY");
  realisticRendering
    .add(directionalLight.position, "z")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("directLighZ");

  realisticRendering
    .add(directionalLight.target.position, "x")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("directLighTargetPositionX")
    .onChange(() => {
      directionalLight.target.updateWorldMatrix(true, true);
    });

  realisticRendering
    .add(directionalLight.target.position, "y")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("directLighTargetPositionY")
    .onChange(() => {
      directionalLight.target.updateWorldMatrix(true, true);
    });

  realisticRendering
    .add(directionalLight.target.position, "z")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("directLighTargetPositionZ")
    .onChange(() => {
      directionalLight.target.updateWorldMatrix(true, true);
    });

  realisticRendering
    .add(directionalLight.shadow.camera, "far")
    .min(-10)
    .max(20)
    .step(0.001)
    .name("directLighShadowCameraFar")
    .onChange(() => {
      directionalLight.shadow.camera.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // -------------------------------------------------------------

  // -------- Controls and helpers

  const orbit_controls = new OrbitControls(camera, canvas);
  orbit_controls.enableDamping = true;

  // ----------------------------------------------
  // ----------------------------------------------

  // -------------- RENDERER
  // ----------------------------------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    //To make the edges of the objects more smooth (we are setting this in this lesson)
    antialias: true,
    // alpha: true,
  });

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // maybe this should be only inside       tick

  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // -------------- SHADOWS ----------------------------------
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // ------------- TONE MAPPING ------------------------------
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;

  realisticRendering.add(renderer, "toneMapping", {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  });
  realisticRendering
    .add(renderer, "toneMappingExposure")
    .min(0)
    .max(10)
    .step(0.001);

  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // ----------- Post Processing ----------------------------
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
    samples: renderer.getPixelRatio() === 1 ? 2 : 0,
  });

  const effectComposer = new EffectComposer(renderer, renderTarget);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  effectComposer.setSize(sizes.width, sizes.height);

  const renderPass = new RenderPass(scene, camera);

  effectComposer.addPass(renderPass);

  const dotScreenPass = new DotScreenPass();

  dotScreenPass.enabled = false;

  effectComposer.addPass(dotScreenPass);

  const glitchPass = new GlitchPass();

  glitchPass.enabled = false;
  // glitchPass.goWild = true;

  effectComposer.addPass(glitchPass);

  const rgbShiftPass = new ShaderPass(RGBShiftShader);

  rgbShiftPass.enabled = false;

  effectComposer.addPass(rgbShiftPass);

  // this in not important (does nothing because it is default)
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // unreal bloom
  const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    1.5,
    0.4,
    0.85
  );
  unrealBloomPass.enabled = false;

  effectComposer.addPass(unrealBloomPass);

  postProcessing.add(unrealBloomPass, "enabled").name("unreal bloom");
  postProcessing
    .add(unrealBloomPass, "strength")
    .min(0)
    .max(2)
    .step(0.001)
    .name("unreal bloom glowStrength");
  postProcessing
    .add(unrealBloomPass, "radius")
    .min(0)
    .max(2)
    .step(0.001)
    .name("unreal bloom glowRadius");
  postProcessing
    .add(unrealBloomPass, "threshold")
    .min(0)
    .max(1)
    .step(0.001)
    .name("unreal bloom glowThreshold");

  // ---------------------------------------------------------
  // Our custom passes
  const TintShader = {
    uniforms: {
      // must have this uniform
      tDiffuse: { value: null },
      // this uniform we will pass after pass creation
      // don't forget that you need to pass it to material
      uTint: { value: null },
    },
    vertexShader: tintVertexShader,
    fragmentShader: tintFragmentShader,
  };

  const tintPass = new ShaderPass(TintShader);

  // this will be 0.2 value for red and 0 for green and 0 for blue
  tintPass.material.uniforms.uTint.value = new THREE.Vector3(0.2, 0, 0);

  tintPass.enabled = false;
  effectComposer.addPass(tintPass);

  postProcessing.add(tintPass, "enabled").name("tintPass (our custom pass)");
  postProcessing
    .add(tintPass.material.uniforms.uTint.value, "x")
    .min(-1)
    .max(1)
    .step(0.001)
    .name("uTint red");
  postProcessing
    .add(tintPass.material.uniforms.uTint.value, "y")
    .min(-1)
    .max(1)
    .step(0.001)
    .name("uTint green");
  postProcessing
    .add(tintPass.material.uniforms.uTint.value, "z")
    .min(-1)
    .max(1)
    .step(0.001)
    .name("uTint blue");

  // ----------
  const DisplacementShader = {
    uniforms: {
      // must have this uniform
      tDiffuse: { value: null },
      // these uniforms always need to be with null value
      // we pass value to them after pass creation
      uTime: { value: null },
      //
      uNormalMap: { value: null },
    },
    vertexShader: displacmentVertexShader,
    fragmentShader: displacmentFragmentShader,
  };

  const displacementPass = new ShaderPass(DisplacementShader);

  displacementPass.material.uniforms.uNormalMap.value =
    new THREE.TextureLoader().load("/textures/interfaceNormalMap.png");
  // displacementPass.material.uniforms.uTime.value = 0;

  displacementPass.enabled = false;
  effectComposer.addPass(displacementPass);

  postProcessing
    .add(displacementPass, "enabled")
    .name("displacementPass (our custom pass)");

  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // needs to be last
  const gammaCorrectionShaderPass = new ShaderPass(GammaCorrectionShader);
  // gammaCorrectionShaderPass.enabled = false;
  effectComposer.addPass(gammaCorrectionShaderPass);

  // needs to be last
  if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass(800, 600);
    effectComposer.addPass(smaaPass);
    console.log("Using SMAA");
  }
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  /**
   * Event Listeners
   */

  window.addEventListener("resize", (e: UIEvent) => {
    console.log("resizing");
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //
    // fixing resize problem
    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "h") {
      gui.show(gui._hidden);
    }
  });

  const mouse = new THREE.Vector2();
  window.addEventListener("mousemove", (_event) => {
    mouse.x = (_event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(_event.clientY / sizes.height) * 2 + 1;

    // console.log({ mouse });
  });

  /* window.addEventListener("dblclick", () => {
    console.log("double click");

    // handling safari
    const fullscreenElement =
      // @ts-ignore webkit
      document.fullscreenElement || document.webkitFullScreenElement;
    //

    // if (!document.fullscreenElement) {
    if (!fullscreenElement) {
      if (canvas.requestFullscreen) {
        // go fullscreen
        canvas.requestFullscreen();

        // @ts-ignore webkit
      } else if (canvas.webkitRequestFullScreen) {
        // @ts-ignore webkit
        canvas.webkitRequestFullScreen();
      }
    } else {
      // @ts-ignore
      if (document.exitFullscreen) {
        document.exitFullscreen();

        // @ts-ignore webkit
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore webkit
        document.webkitExitFullscreen();
      }
    }
  }); */

  // ---------------------- TICK -----------------------------
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // ---------------------------------------------------------

  const clock = new THREE.Clock();

  /**
   * @description tick
   */
  function tick() {
    // for dumping to work
    orbit_controls.update();

    displacementPass.material.uniforms.uTime.value = clock.getElapsedTime();

    // so instead of this
    // renderer.render(scene, camera);
    // we use this
    effectComposer.render();

    window.requestAnimationFrame(tick);
  }

  tick();
}
