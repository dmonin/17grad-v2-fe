# 17GRAD Website

## Why we open up code of our website?

I felt nostalgic about the times, when you could click View Source button of websites like Yahoo, or most of the websites, and learn from it, see how it works.

At some point of time, for performance reasons, websites started to minify the code. Compile the code for faster performance, and internet became a closer place.

## Framework choice

I could pick React, Vue, or Angular, or even lightweight Svelte or brand new SolidJS, though we thought, JavaScript will stay always JavaScript. Why not dig in into what modern browsers have to offer and use that.

At the beginning of the days, you've had little code snippets for standartization between IE, Mozilla, and maybe Opera. Then libraries appeared which did this standartization for you.

Than a lot of JavaScript appeared and websites became kinda heavy, then compilers came in.

Nowadays libraries do less of standartization, but rather provide features like DOM manipulation, UI Elements, etc.

Though what if you don't need much.

## Language choice

I could pick up TypeScript for that, which we (17GRAD) do by the way on 90% of our projects, for the sake of static code checking and code completion for developers within the team. But again... in this I wanted something which runs in the browser, without the need of any compiler. Plain & Simple.



## How to Start

It might not work fully. The project is a bit more complex than this.

In the backend I use connection to assets sources, image minification and optimization, connection to cloud and CDN providers, connection to text translation provider, which has been stripped away for the sake of simplicity. Neither we wanted to include these resources statically, as we believe those files do not belong to GIT.

**But,** there is a way to start it and try it out
```sh
# Install packages
yarn

# Compile CSS
yarn scss-watch

# Start Server
yarn dev
```

This will stark local server. As it's only javascript, no framework etc. It doesn't need to be compiled in the development mode.

## What you can learn from this

### Browser History API
Most modern browsers provide already out of the box great APIs for browser history. It's simple, and you don't need a package to use this.

For instance saving not just the page url, but the state of different components visible on the screen, is much easier to my feeling with native API, than using any package for this.

### Use CSS-Vars for parallax
I used CSS vars, to provide global mouse & parallax positions, so designers could easily fine-tune animations, having this variables in place. So basically on page scroll, mouse move, you need to update only these global / local variables, no need to set individual styles.

Each component can have unique set of styles it adjusts for own parallax independently

### Scoring 100 on Benchmarks

Stay tuned. More coming soon here...

### Shaders & Native scrolling

Stay tuned. More coming soon here...

## Loading

Stay tuned. More coming soon here...

## Useful JavaScript components

Stay tuned. More coming soon here...