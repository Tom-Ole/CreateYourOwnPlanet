<script lang="ts">
  import Planet from "$lib/components/Planet.svelte";
  import * as THREE from "three";
  import { onMount } from "svelte";

  let displacementCtx: CanvasRenderingContext2D;
  let bumpCtx: CanvasRenderingContext2D;
  let displacementCanvas: HTMLCanvasElement | null;
  let bumpCanvas: HTMLCanvasElement | null;

  let colorRange = 15;
  let color = "#ffffff";

  onMount(() => {
    displacementCanvas = document.querySelector(
      "#displacementCanvas"
    ) as HTMLCanvasElement;
    bumpCanvas = document.querySelector("#bumpCanvas") as HTMLCanvasElement;

    let circle: HTMLSpanElement | null;

    let strokeWidth = 25;
    if (displacementCanvas)
      displacementCtx = displacementCanvas.getContext("2d")!;
    if (bumpCanvas) bumpCtx = bumpCanvas.getContext("2d")!;

    let latestPoint: number[] = [];
    let drawing = false;

    let startStroke = (point: number[]) => {
      drawing = true;
      latestPoint = point;
    };

    let draw = (newPoint: number[], ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.moveTo(latestPoint[0], latestPoint[1]);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(newPoint[0], newPoint[1]);
      ctx.stroke();
      latestPoint = newPoint;
    };

    let mouseMove = (evt: MouseEvent, ctx: CanvasRenderingContext2D) => {
      setCircleToMouse(evt);
      if (!drawing) return;
      draw([evt.offsetX, evt.offsetY], ctx);
    };

    let mouseDown = (evt: MouseEvent) => {
      if(evt.button === 0) {
        console.log(color)
      } else if (evt.button === 2) {
        evt.preventDefault();
        color = "#000000";
      }
      if (drawing) return;
      startStroke([evt.offsetX, evt.offsetY]);
    };

    const endStroke = (evt: MouseEvent) => {
      if (!drawing) return;
      drawing = false;
    };

    if (!displacementCanvas) console.warn("cannot find canvas");

    let setCircleToMouse = (evt: MouseEvent) => {
      if (!circle) return;
      let posY = evt.clientY - strokeWidth / 2;
      let posX = evt.clientX - strokeWidth / 2;
      circle.style.top = `${posY}px`;
      circle.style.left = `${posX}px`;
    };

    let removeCicle = (time: number) => {
      if (!circle) return;
      setTimeout(() => {
        circle?.remove();
      }, time);
    };

    displacementCanvas.addEventListener("mousedown", mouseDown, false);
    displacementCanvas.addEventListener(
      "mousemove",
      (e) => mouseMove(e, displacementCtx),
      false
    );
    displacementCanvas.addEventListener("mouseup", endStroke, false);
    displacementCanvas.addEventListener(
      "mouseleave",
      (ev) => {
        endStroke(ev);
        removeCicle(1);
      },
      false
    );
    displacementCanvas.addEventListener("mouseenter", (e) => createCircle(e));
    displacementCanvas.addEventListener("contextmenu", (evt) =>
      evt.preventDefault()
    );

    bumpCanvas.addEventListener("mousedown", mouseDown, false);
    bumpCanvas.addEventListener(
      "mousemove",
      (e) => mouseMove(e, bumpCtx),
      false
    );
    bumpCanvas.addEventListener("mouseup", endStroke, false);
    bumpCanvas.addEventListener(
      "mouseleave",
      (ev) => {
        endStroke(ev);
        removeCicle(1);
      },
      false
    );
    bumpCanvas.addEventListener("mouseenter", (e) => createCircle(e));
    bumpCanvas.addEventListener("contextmenu", (evt) => evt.preventDefault());

    const createCircle = (ev: MouseEvent) => {
      let container = document.querySelector("#canvasContainer");
      if (!container) return;
      circle = document.createElement("span");
      circle.id = "strokeWidthCirlce";
      circle.style.pointerEvents = "none";
      circle.style.width = `${strokeWidth}px`;
      circle.style.height = `${strokeWidth}px`;
      circle.style.outline = "solid black 1px";
      circle.style.position = "absolute";
      circle.style.borderRadius = "100%";
      let posY = ev.clientY - strokeWidth / 2;
      let posX = ev.clientX - strokeWidth / 2;
      circle.style.top = `${posY}px`;
      circle.style.left = `${posX}px`;
      circle.style.display = "table";
      circle.style.margin = "0 auto";
      let conatinerParent = container.parentElement;
      conatinerParent?.append(circle!);
    };

    const appendCircle = (ev: WheelEvent, container: Element) => {
      let boundingClientRect = container.getBoundingClientRect();

      let canvasTop = boundingClientRect.top;
      let canvasRight = boundingClientRect.right;
      let canvasBottom = boundingClientRect.bottom;
      let canvasLeft = boundingClientRect.left;

      if (circle) circle.remove();

      if (
        ev.clientX > canvasLeft &&
        ev.clientX < canvasRight &&
        ev.clientY > canvasTop &&
        ev.clientY < canvasBottom
      ) {
        createCircle(ev);

        if (ev.deltaY < 0) {
          strokeWidth += 1;
        } else {
          strokeWidth += -1;
        }
      }
    };

    document.onwheel = (ev: WheelEvent) => {
      if (!displacementCanvas || !bumpCanvas) return;
      let container = document.querySelector("#canvasContainer");
      if (container) appendCircle(ev, container);
    };

    let colorRangeInput = document.querySelector("#colorRange") as HTMLInputElement
    console.log(colorRangeInput)
    let colorIndicator = document.querySelector(".colorIndicator") as HTMLSpanElement
    let setColor = () => {
      console.log(colorRange.toString(16));
      let colorTemp = colorRange.toString(16) //+ "0" 
      color = "#" + colorTemp.repeat(6)

      colorIndicator.style.backgroundColor = color
      console.log(color)
    };
    colorRangeInput!.addEventListener("change", setColor)

  }); // Close onMount

  let displacementMap: THREE.Texture;
  let bumpMap: THREE.Texture;

  const setNewDisplacement = () => {
    if (!displacementCanvas) return;
    let boundingClientRect = displacementCanvas.getBoundingClientRect();

    let canvasWidth = boundingClientRect.width;
    let canvasHeight = boundingClientRect.height;

    let imageData = displacementCtx.getImageData(
      0,
      0,
      canvasWidth,
      canvasHeight
    );
    console.log(imageData);

    let dataTexture = new THREE.DataTexture(
      imageData.data,
      canvasWidth,
      canvasHeight,
      THREE.RGBAFormat
    );
    dataTexture.anisotropy = 4;
    dataTexture.colorSpace = THREE.SRGBColorSpace;
    dataTexture.needsUpdate = true;

    displacementMap = dataTexture;
  };

  const setNewBumpMap = () => {
    if (!bumpCanvas) return;
    let boundingClientRect = bumpCanvas.getBoundingClientRect();

    let canvasWidth = boundingClientRect.width;
    let canvasHeight = boundingClientRect.height;

    let imageData = bumpCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    console.log(imageData);

    let dataTexture = new THREE.DataTexture(
      imageData.data,
      canvasWidth,
      canvasHeight,
      THREE.RGBAFormat
    );
    dataTexture.anisotropy = 4;
    dataTexture.colorSpace = THREE.SRGBColorSpace;
    dataTexture.needsUpdate = true;

    bumpMap = dataTexture;

  };
</script>

<div class="container">
  <div id="canvasContainer">
    <h4 class="canvasLable">Displacement Map:</h4>
    <canvas width="300px" height="300px" id="displacementCanvas" />
    <button on:click={setNewDisplacement}>Save displacementMap</button>
    <h4 class="canvasLable">Bump Map:</h4>
    <canvas width="300px" height="300px" id="bumpCanvas" />
    <button on:click={setNewBumpMap}>Save bumpMap</button>
    <label class="colorLabel">
      Color:
      <input
      type="range"
      min="0"
      max="15"
      bind:value={colorRange}
      id="colorRange"
      />
      <span class="colorIndicator"></span>
    </label>
  </div>
  <div class="planetContainer">
    <Planet {displacementMap} {bumpMap} />
  </div>
</div>

<style>
  .container {
    min-width: 100vw;
    min-height: 100vh;
    background-color: #4d4539;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 100px;
  }

  canvas {
    background-color: black;
    filter: invert();
  }

  #canvasContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
  }

  #canvasContainer button {
    margin: 2px 0;
  }

  .canvasLable {
    margin: 10px 0 5px 0;
    padding: 0;
  }

  .colorLabel {
    position: relative;
    display: flex;
    justify-items: center;
    align-items: center;
  }

  .colorIndicator {
    position: absolute;
    right: -25px;
    aspect-ratio: 1/1;
    height: 80%;
    border-radius: 100%;
    background-color: white;
    filter: invert();
  }

</style>
