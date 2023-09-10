<script lang="ts">
    import * as THREE from "three";
    import * as SC from "svelte-cubed";
  
    let radius = 1;
    let spin = 0;
    let autoSpin = false;


  
    export let displacementMap: THREE.Texture;
    export let bumpMap: THREE.Texture;
  
    $: material = new THREE.MeshStandardMaterial({
      color: 0x1f3300,
      bumpMap: bumpMap,
      bumpScale: 1,
      displacementMap: displacementMap,
      displacementScale: 0.1,
    });


    SC.onFrame(() => {
      if(autoSpin) spin += 0.01;
    });
  </script>
  
  <div class={"planetContainer "}>
    <SC.Canvas  antialias shadows background={new THREE.Color("papayawhip")}>
      <SC.Mesh
        geometry={new THREE.SphereGeometry(radius, 32,32)}
        {material}
        rotation={[0, spin, 0]}
      />
      <SC.PerspectiveCamera position={[1, 1, 3]} />
      <SC.OrbitControls enableZoom={true} enablePan={false} />
      <SC.AmbientLight intensity={0.1} />
      <SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} />
    </SC.Canvas>
  <div class="controls">
    <label>
      Auto Spin 
      <input type="checkbox" bind:checked={autoSpin} value={autoSpin}/>
    </label>
  </div>
</div>
  
  <style>
    .controls {
      position: absolute;
      top: 0;
      left: 0;
    }

    .planetContainer {
        position: relative;
        width: 500px;
        height: 500px;
    }

  </style>
  