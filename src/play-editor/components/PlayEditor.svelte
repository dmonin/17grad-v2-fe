<script>
	import CollageEditor from './CollageEditor.svelte';
	import Button from './Button.svelte';
	import PositionEditor from './PositionEditor.svelte';
	import { currentElement } from './../stores/current-element.js';
	import Property from './Property.svelte';
  import Slider from './Slider.svelte';
  import { fly } from 'svelte/transition';

  let isCollageEditorMode = false;

  function handleParallaxChange(e) {
    if (currentElement) {
      currentElement.update(el => {
        el.parallax = e.detail;
        el.updatePosition();
        return el;
      });
    }
  }

  function handlePositionUpdate(e) {
    currentElement.update(el => {

      el.position = e.detail;
      el.element.style.left = el.position.x + 'vw';
      if (el.position.bottomAlignment) {
        el.element.style.top = '';
        el.element.style.bottom = el.position.y + '%';
      } else {
        el.element.style.top = el.position.y + '%';
        el.element.style.bottom = '';
      }
      el.element.dataset.alignment = el.position.bottomAlignment ? 'bottom' : 'top';
      return el;
    })
  }

  function handleWidthChange(e) {
    if (currentElement) {
      currentElement.update(el => {
        el.width = e.detail;
        el.element.style.width = el.width + 'vw';
        return el;
      });
    }
  }

  function handleClose() {
    currentElement.set(null);
  }

  function handleZIndexUpdate(e) {
    if (currentElement) {
      currentElement.update(el => {
        el.zIndex = e.detail;
        el.element.style.zIndex = el.zIndex;
        return el;
      });
    }
  }

  function handleEditCollage() {
    isCollageEditorMode = true;
    console.log($currentElement.collage);
  }

  function handleRemove() {

  }

</script>
{#if $currentElement}
<div class="play-editor" transition:fly="{{ x: 300, duration: 300 }}">
  <div class="play-editor-header">
    {$currentElement.name}
    <div class="player-editor-close" on:click={handleClose} >
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" xml:space="preserve">
        <line x1="5.3" y1="5.3" x2="26.7" y2="26.7"></line>
        <line x1="5.3" y1="26.7" x2="26.7" y2="5.3"></line>
      </svg>
    </div>
  </div>
  <div class="play-editor-body">
    {#if isCollageEditorMode}
    <CollageEditor collage={$currentElement.collage} />
    {:else}
      <Property title="Parallax">
        <Slider
          min=0 max=100 units='vw'
          bind:value={$currentElement.parallax}
          on:change={handleParallaxChange} />
      </Property>

      <Property title="Position">
        <PositionEditor
          on:update={handlePositionUpdate}
          position={$currentElement.position} />
      </Property>

      <Property title="Width">
        <Slider
          min=1 max=50 step=0.1 units='vw'
          bind:value={$currentElement.width}
          on:change={handleWidthChange} />
      </Property>

      <Property title="Z-Index">
        <Slider min=1 max=20 bind:value={$currentElement.zIndex} on:change={handleZIndexUpdate} />
      </Property>

      <div class="player-editor-buttons">
        <Button on:click={handleEditCollage}>Edit Collage</Button> <Button on:click={handleRemove}>Remove</Button>
      </div>
    {/if}

  </div>
</div>
{/if}

<style>
  .play-editor {
    background: #383838;
    color: #d9d9d9;
    height: 100%;
    right: 0;
    position: fixed;
    top: 0;
    width: 500px;
    z-index: 15;
  }

  .play-editor-header {
    background: #262626;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
  }

  .play-editor-body {
    padding: 10px 20px 20px 20px;
  }

  .player-editor-close {
    cursor: pointer;
    height: 20px;
    width: 20px;
    transition: transform 0.15s ease-out;
  }

  .player-editor-close:hover {
    transform: scale(1.5);
  }

  .player-editor-close line {
    stroke: #fff;
  }

</style>