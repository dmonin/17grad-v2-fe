<div class="player-editor-button" on:click>
  <slot></slot>
</div>
<style>
  .player-editor-button {
    background: #000;
    color: #d6d6d6;
    cursor: pointer;
    display: inline-block;
    margin-right: 10px;
    padding: 5px 20px;
  }

  .player-editor-button:hover {
    background: #4747FE;
  }
</style>