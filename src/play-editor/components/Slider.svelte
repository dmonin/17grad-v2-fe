<script>
  import { createEventDispatcher } from "svelte";
  export let min = 0;
  export let max = 10;
  export let value = 0;
  export let step = 1;
  export let units = '';

  const dispatcher = createEventDispatcher();

  function handleChange(e) {
    dispatcher('change', parseFloat(value));
  }
</script>
<div class="slider">
  <input type="range" bind:value={value} min={min} max={max} step={step} on:input={handleChange} />
  <input type="number" bind:value={value} /><span class="units">{units}</span>
</div>
<style>
  .slider {
    display: flex;
  }

  .units {
    margin-left: 5px;
  }

  input[type=number] {
    background: #262626;
    border: 1px solid #1e1e1e;
    border-radius: 3px;
    color: inherit;
    margin-left: 10px;
    padding: 2px 5px;
    text-align: center;
    width: 50px;
  }

  input[type=range] {
    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
    /*width: 100%;  Specific width is required for Firefox. */
    background: transparent; /* Otherwise white in Chrome */
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
  }

  input[type=range]:focus {
    outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
  }

  /* Special styling for WebKit/Blink */
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    border-radius: 7px;
    height: 16px;
    width: 16px;
    margin-top: -6px;
    background: #4747FE;
    cursor: pointer;

  }

  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 3px;
    cursor: pointer;
    margin-top: 9px;
    background: #4747FE;
    border-radius: 5px;
  }

  input[type=range]:focus::-webkit-slider-runnable-track {
    background: #4747FE;
  }

</style>