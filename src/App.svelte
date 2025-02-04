<script>
  import Highlight from './components/Highlight.svelte';
  import { onMount } from 'svelte';
  const imageUrl = "https://cdn.prod.website-files.com/63531edd0af27d6d2cbf16b1/639a61119783921581253241_design-challenges.webp"; // Replace with your image URL

  let containerRef;

  onMount(() => {
    const handleScroll = () => {
      if (!containerRef) return;
      
      console.log('Scrolling', {
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        windowHeight: window.innerHeight,
        containerWidth: containerRef.scrollWidth,
        windowWidth: window.innerWidth
      });
      
      const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const maxTranslate = containerRef.scrollWidth - window.innerWidth;
      containerRef.style.transform = `translateX(-${scrollPercentage * maxTranslate}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<style>
  .scroll-container {
    height: 300vh;
  }

  .content-container {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    display: flex;
  }

  .column {
    width: 400px;
    flex-shrink: 0;
    padding: 20px;
    margin-right: 60px;
    text-align: justify;
    line-height: 1.6;
    font-size: 20px;
    position: relative;
    min-height: 100vh;
  }
  .column-content:hover{
    filter: blur(0px);
    transition-duration: 1s;
  }

  .column-content {
    filter: blur(4px);
    transition: filter 0.3s ease;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 40px);
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    height: 100vh;
  }

  .column {
    scroll-snap-align: start;
  }
</style>

<div class="scroll-container">
  <!-- what is a hover but attention -->
  <div 
    class="content-container" 
    bind:this={containerRef}
  >
  <div class="column">
    <div class="column-content">
    </div>
  </div>
    <div class="column">
      <div class="column-content">
        <p style="color:gray;">Please click on this webpage once to enable the audio effect</p>
        One night I found myself 
        <Highlight 
          text="listening" 
          imageUrl={"listening.JPG"} 
          color="white"
          audioUrl="/removethedefender.mov"
          hoverText="remove the defender by Yaktus; if you don't hear anything, click on the webpage and hover again"
        />
        to a song from a college indie band whose concert I attended at the basement of the co-op next to mine. 
        to the looping bass, the loose melody and voice of the singer, I felt an indescribable feeling wash over me. 
        Eyes soft, imperceptibly so, reaching for something just beyond my fingertips.
      </div>
    </div>

    <div class="column">
      <div class="column-content">
        The day prior I had met up with some people from the co-op, the first time this particular group of people had met in three years. An intersection of time - do you think you can be in two places at once? 
        <Highlight 
        text="You are at an intersection" 
        imageUrl={"crossing.jpeg"} 
        color="yellow"
      />
        and you look both ways before crossing.
      </div>
    </div>

    <div class="column">
      <div class="column-content">
        The song traced a bittersweetness in my memory - the lingering desperation I had in college for approval and foolish belief that if I achieved certain goals I would finally become the person I wanted to be without looking any closer. I had 
        <Highlight 
        text="forgotten parts of myself" 
        imageUrl={"forgetting.jpeg"} 
        color="brown"
        hoverText="evident in my first blog post ever"
      />
        as a result. With no one around to witness them, it was if they were never there.
      </div>
    </div>

    <div class="column">
      <div class="column-content">
        Three years since is so much time, yet so little. I had done so much, yet so little, but at the very least I was slowly becoming myself again. Towards the end of 2023, I made a  
        <Highlight 
        text="website" 
        imageUrl={"website.png"} 
        color="blue"
        hoverText="connie.surf"
      />
        as a declaration that I was going to make art and share it and it was going to be bad and inconsistent and unpolished but at the very least! At the very least I was going to try!
      </div>
    </div>
    <!-- <div class="column">
      <div class="column-content">
        <strong>nestled in winter</strong>
        I wanted to make a website to hold the entirety of myself and spent a lot of time fiddling around trying to find definition. I didn't really know what I was going to create and judging by what I had done in the past, there wasn't a clear theme. Looking back, I'm somewhat impressed with being able to consistently chip away at designing and coding the current version of connie.surf over a few days2. At the end, it was nice to have a vessel to explain my current self and what I wanted to become.
      </div>
    </div> -->
    <div class="column">
      <div class="column-content">
        Into the spring, I self-published a comic compilation to express and get out some feelings I had going through major life changes. Speaking things into existence only makes them more 
      
        <Highlight 
        text="real" 
        imageUrl={"wall.jpeg"} 
        color="darkgreen"
        hoverText="wall text: poetry blushes but never runs away"
      />
        , but it was what I needed to see clearly. It was how I could move forward.
      </div>
    </div>
    <div class="column">
      <div class="column-content">
        Spring was also a chance to share said work with the world, I started posting more on social media and put my comics and zines up at some consignment stores. I didn't expect for a few friends and random people to reach out to me to tell me how much the work resonated with them. How 
        <Highlight 
        text="beautiful" 
        imageUrl={"seen.png"} 
        color="pink"
        hoverText="snippet of a slide from a comics workshop"
      />
        it is to be seen for myself as I was!
      </div>
    </div>
    <div class="column">
      <div class="column-content">
        Later on, I also got the chance to teach my first workshop at camp, at the end we all made mini 4-8 panel comics and did a small show and tell which was so incredibly heartwarming. I also did an array of experiments for camp under a general theme of 
        <Highlight 
        text="machine yearning" 
        imageUrl={"yearn.png"} 
        color="blue"
        hoverText="not linked anywhere because they’re all 20% done… I mostly wanted an excuse to quickly figure out new technologies, for example: machineyearning.glitch.me was experiment I did to use a websocket where you can pass notes to someone, the UI feedback is haphazard because of.. a skill issue…"
      />
        (or more aptly different manifestations of my own yearning).
      </div>
    </div>
    <div class="column">
      <div class="column-content">
        I started writing as a way to understand the world, not just myself. I'd 
        <Highlight 
        text="record" 
        imageUrl={"ping.jpg"} 
        color="maroon"
        hoverText="It was cool later hearing about this process as “pings” from Laurel Schwulst’s talk earlier this year. Noticing as a way of practice."
      />
        articles, quotes, and things from my every day life over a few months in my messenger app, until enough bubbled up into a coherent stream of thoughts. A looser kind of research that was a slow accumulation over time, which felt like a new way of seeing.
      </div>
    </div>
    <div class="column">
      <div class="column-content">
        I rounded off the year with several more ambitious software projects simmering in my brain, to only 
        <Highlight 
        text="run out of time" 
        imageUrl={"time.jpeg"} 
        color="navy"
      />
        with other random life events (moving, getting sick, work) which left only scattered time to dedicate to them and some major skill issues where I didn't know how exactly to develop them or start.
      </div>
    </div>
    <div class="column">
      <div class="column-content">
        As part of practice, I also want to live 
        <Highlight 
        text="lighter." 
        imageUrl={"lighter.jpeg"} 
        color="black"
      />
        Instead of spending so much time trying to predict the future and analyze what the "right thing" to do, I want to let go of expectation and be guided from what stirs within me.
      </div>
    </div>
    <div class="column">
      <div class="column-content">
        The past year I felt like I had lived in a way that was markedly different from how I spent the four before that. At the end of this year I read 
        
        <Highlight 
        text="'The Creative Act'" 
        imageUrl={"creativeact.jpg"} 
        color="goldenrod"
      />
         and felt a deja vu for a fair share of the book. I had not done that much, but I had done something at the very least, I moved forward.
      </div>
    </div>
    <div class="column">
      <div class="column-content">
        When I first graduated I didn't really know what I wanted to do. The most I could articulate was a vague desire to maybe illustrate some things and sell it at an art fair. I sold at a few this year with the help of friends who had 
        <Highlight 
        text="extra space" 
        imageUrl={"sell.jpeg"} 
        color="white"
      />
         on their table, and even 
         <Highlight 
         text="tabled" 
         imageUrl={"dataset.jpeg"} 
         color="white"
         hoverText="at the dataset farmer's market!"
       />
          with friends at the very end of the year! I can understand it more clearly, it wasn't the act of selling at a fair really, it was being able to connect with others over creativity as a way to interact with the world. And it didn't have to be at a fair even, just passing conversations on the train, at a chance encounter, on the interwebs, anywhere and anytime at all was more than enough for me. I'm so grateful to everyone I've met, and have yet to meet!
        
        </div>

    </div>
    <div class="column">
      <div class="column-content">
        <p>
          Thanks for reading! You can read more of my writing <a href="https://corny.substack.com">here</a>!
        </p>
      </div>
    </div>
  </div>
</div>