<script>
  import { createEventDispatcher } from "svelte";

  import Slider from './Slider.svelte';

  export let position = {};

  const dispatcher = createEventDispatcher();

  let pressedKey = '';
  function handleKeyDown(e) {
    pressedKey = e.key;
    let value = 0.1;
    if (e.shiftKey) {
      value = 1;
    }
    if (e.metaKey) {
      value = 10;
    }

    if (pressedKey == 'ArrowLeft') {
      e.preventDefault();
      position.x -= value;
    } else if (pressedKey == 'ArrowRight') {
      e.preventDefault();
      position.x += value;
    } else if (pressedKey == 'ArrowUp') {
      e.preventDefault();
      position.y -= value;
    } else if (pressedKey == 'ArrowDown') {
      e.preventDefault();
      position.y += value;
    }

    dispatcher('update', position);
  }

  function handleKeyUp(e) {
    pressedKey = '';
  }

  function handleXUpdate(e) {
    position.x = e.detail
    dispatcher('update', position);
  }

  function handleYUpdate(e) {
    position.y = e.detail;
    dispatcher('update', position);
  }

  function changeAlignment() {
    position.bottomAlignment = !position.bottomAlignment;
    dispatcher('update', position)
  }
</script>
<div>

  <div class="controls-wrap">
    <div class="controls">
      <div class="key up" class:active={pressedKey == 'ArrowUp'}></div>
      <div class="key left" class:active={pressedKey == 'ArrowLeft'}></div>
      <div class="key down" class:active={pressedKey == 'ArrowDown'}></div>
      <div class="key right" class:active={pressedKey == 'ArrowRight'}></div>
    </div>
    <div class="controls-info">
      Use keyboard to move element.
    </div>
  </div>

  <div>
    <div class="axis-property">
      <div class="axis-label">X</div>
      <Slider min=0 max=150 step=0.1 units='vw' value={position.x} on:change={handleXUpdate} />
    </div>

    <div class="axis-property">
      <div class="axis-label y"
        class:bottom={position.bottomAlignment}
        on:click={changeAlignment}>
        <span>Y</span>
      </div>
      <Slider min=0 max=100 step=0.1 units='%' value={position.y} on:change={handleYUpdate} />
    </div>
  </div>
</div>

<style>
  .controls-wrap {
    display: flex;
    align-items: center;;
    margin-bottom: 20px;
  }
  .controls-info {
    padding-left: 20px;
  }
  .controls {
    display: flex;
    width: 63px;
    flex-wrap: wrap;;
  }
  .key {
    background: #262626;
    margin-right: 1px;
    width: 20px;
    height: 20px;
  }

  .key.up {
    margin-left: 21px;
    margin-right: 20px;
    margin-bottom: 1px;
    margin-top: 0;
  }


  .key.active {
    background: white;
  }

  .axis-property {
    display: flex;
    margin-bottom: 15px;
  }

  .axis-label {
    width: 50px;
  }

  .axis-label.y span {
    border-top: 1px solid #d9d9d9;
    cursor: pointer;
  }

  .axis-label.y span:hover {
    color: #fff;
  }

  .axis-label.bottom span {
    border-bottom: 1px solid #d9d9d9;
    border-top: 0px none;
  }


</style>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp}/>