<script>
    export let text;
    export let imageUrl = '';
    export let hoverText = '';
    let showContent = false;

    // Validate that only one type of content is provided
    if (imageUrl && hoverText) {
        console.warn('Both imageUrl and hoverText provided. Only one should be used.');
    }
</script>

<style>
    .highlight-wrapper {
      position: relative;
      display: inline-block;
    }

    .highlight {
      cursor: pointer;
      display: inline-block;
      text-decoration-line: underline;
      text-decoration-style: wavy;
      text-decoration-color: red;
    }

    .image-container {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      width: 200px;
      z-index: 10;
    }

    .preview-image {
      width: 100%;
      height: auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      border-radius: 4px;
    }

    .text-container {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 4px;
      font-size: 0.9em;
      line-height: 1.4;
      max-width: 200px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .content-bridge {
      position: absolute;
      top: 100%;
      left: 0;
      height: 8px;
      width: 100%;
    }
</style>

<div 
  class="highlight-wrapper"
  on:mouseenter={() => showContent = true}
  on:mouseleave={() => showContent = false}
>
  <span class="highlight">
    {text}
  </span>
  {#if showContent}
    <div class="content-bridge"></div>
    {#if imageUrl}
      <div class="image-container">
        <img src={imageUrl} alt={text} class="preview-image"/>
      </div>
    {:else if hoverText}
      <div class="text-container">
        {hoverText}
      </div>
    {/if}
  {/if}
</div>
  