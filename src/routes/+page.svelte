<script>
  import * as THREE from "three";
  import * as SC from "svelte-cubed";

  let radius = 1;

  let textureLoader = new THREE.TextureLoader()
  let displacementMap = textureLoader.load("assets/displacement.png");
  let bumpMap = textureLoader.load("assets/bump.png")

  let material = new THREE.MeshToonMaterial({ 
    color: 0x1f3300,
    bumpMap: bumpMap,
    bumpScale: 1,
    displacementMap: displacementMap,
    displacementScale: 0.1,
  })

  

  let spin = 0
  SC.onFrame(() => {
    spin += 0.01
  })

</script>

<SC.Canvas antialias shadows background={new THREE.Color("papayawhip")} >
  <SC.Mesh
    geometry={new THREE.SphereGeometry()}
    material={material}
    scale={[radius, radius+0.01, radius]}
    rotation={[0, spin, 0]}
  />
  <SC.PerspectiveCamera position={[1, 1, 3]} />
  <SC.OrbitControls enableZoom={false} />
  <SC.AmbientLight intensity={0.1} />
  <SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} />
</SC.Canvas>

<div class="controls">
  <label>
    <input type="range" bind:value={radius} min={0.1} max={3} step={0.1} />
    Radius
  </label>
</div>

<style>
  .controls {
    position: absolute;
  }
</style>
