<script>
  import { createEventDispatcher } from "svelte";


    const dispatcher = createEventDispatcher();
  </script>
  <div class="navigation-item" on:click={() => dispatcher('select')}>
    <slot></slot>
  </div>

  <style>
    .navigation-item {
      cursor: pointer;
      padding: 5px 15px;
    }
    .navigation-item:hover {
      background: #999;
      color: #5e5e5e;
    }
  </style>