<script>
  export let collage = [];

  $: {
    // Calculating min max
    const xRange = [0, 0];
    const yRange = [0, 0];
    let maxHeight = 0;
    for (const collageItem of collage) {
      const aspectRatio = collageItem.responsive.height / collageItem.responsive.width;
      const width = collageItem.width * collageItem.responsive.width;
      const height = aspectRatio * width;

      xRange[0] = Math.min(width - collageItem.offset);

      maxHeight = Math.max(maxHeight, collageItem.width * aspectRatio);
    }
    console.log(maxHeight);
  }

</script>
<div class="collage-editor">
  {#each collage as collageItem}
    <div class="collage-editor-item">
      <img
        srcset={collageItem.responsive.srcset}
        alt=""
        width={collageItem.responsive.width}
        height={collageItem.responsive.height} />
    </div>
  {/each}
</div>

<style>
  .collage-editor {
    border: 1px solid #d6d6d6;
    margin: 20px;
  }
  .collage-editor-item {
    position: absolute;
  }
</style>