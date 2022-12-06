<script>
  export let title = 'Property';
</script>
<div class="property">
  <div class="label">{title}</div>
  <slot></slot>
</div>

<style>
  .property {
    display: flex;
    border-bottom: 1px solid #262626;
    padding: 10px 0 20px 0;
  }

  .property:last-child {
    border-bottom: 0px none;
  }

  .label {
    padding-top: 8px;
    width: 100px;
  }
</style>