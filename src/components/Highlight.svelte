<script>
  export let text;
  export let imageUrl = 'https://picsum.photos/1200/801'; 
  export let color = 'inherit';
  export let hoverText = '';
  export let audioUrl = '';

  let audio;

  function handleMouseEnter(event) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    const column = event.target.closest('.column');
    const columnContent = column?.querySelector('.column-content');
    
    if (column) {
      column.style.color = color;
    }
    
    if (hoverText && columnContent && !document.querySelector('.tooltip-content')) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip-content';
      tooltip.textContent = hoverText;
      columnContent.appendChild(tooltip);
    }
    
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  function handleMouseLeave(event) {
    document.body.style.backgroundImage = 'none';
    const column = event.target.closest('.column');
    if (column) {
      column.style.color = 'black';
    }
    const tooltip = document.querySelector('.tooltip-content');
    if (tooltip) {
      tooltip.remove();
    }
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
    pointer-events: auto;
    position: relative;
    z-index: 1;
  }


  :global(body) {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-attachment: fixed;  
    min-height: 100vh;  
    transition: background-image 0.3s ease;
    margin: 0;  
    padding: 0; 
  }

  :global(.column) {
    transition: color 0.3s ease;
  }

  :global(.tooltip-content) {
    position: absolute;
    font-style:italic;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    opacity: 0.7;
    color: yellow !important;
    border-radius: 4px;
    transition: opacity 0.3s ease;
    white-space: wrap;
    margin-top: 10px;  
    z-index: 100;     
    font-size: 0.8em;
    text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000;
    width: 400px;
    justify-content: center;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;

  }
</style>

<audio 
  bind:this={audio} 
  preload="auto"
  src={audioUrl}
  loop
></audio>

<div 
  class="highlight-wrapper"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <span class="highlight">
    {text}
  </span>
</div>
