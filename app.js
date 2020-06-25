(function (
  {
    webkitSpeechGrammar: Grammar,
    webkitSpeechGrammarList: GrammarList,
    webkitSpeechRecognition: SpeechRecognition,
    webkitSpeechRecognitionEvent: SpeechRecognitionEvent
  } = window) {

  const TOKEN_TURN = "turn";
  const TOKEN_LDIR = "left";
  const TOKEN_RDIR = "right";
  const TOKEN_DEGS = "degrees";

  const STATE_INIT = "STATE_INIT";
  const STATE_RJCT = "STATE_RJCT";
  const STATE_TURN = "STATE_TURN";
  const STATE_TDIR = "STATE_TDIR";
  const STATE_TNUM = "STATE_TNUM";
  const STATE_TDEG = "STATE_TDEG";

  const accepts = new Set([
    STATE_TDEG
  ]);
  const rejects = new Set([
    STATE_RJCT
  ]);

  const transition = (state, token, cdata) => {
    switch (state) {
      case STATE_INIT:
        switch (token) {
          case TOKEN_TURN:
            return STATE_TURN;
        }
        break;

      case STATE_TURN:
        switch (token) {
          case TOKEN_LDIR:
          case TOKEN_RDIR:
            cdata.direction = token;
            return STATE_TDIR;
        }
        break;

      case STATE_TDIR:
        switch (token) {
          case "5":
          case "10":
          case "15":
          case "30":
          case "45":
          case "60":
          case "75":
          case "90":
          case "105":
          case "120":
          case "135":
            cdata.degrees = parseInt(token, 10);
            return STATE_TNUM;
        }
        break;

      case STATE_TNUM:
        switch (token) {
          case TOKEN_DEGS:
            return STATE_TDEG;
        }
        break;
    }
    return STATE_RJCT
  };

  const DIST_PER_MS = 0.013;
  const DEGS_PER_MS = 0.09;
  class Actor {

    constructor(x, y) {
      this.t = Date.now();
      this.x = x;
      this.y = y;
      this.d = 0;
      this.s = 0;// 0 = UP or RIGHT, mod around 360 and ABS for right number?
      this.degrees_remaining;
      this.steering = 0;
      this.turning = 0;
      // this.direction = 0; // 0 -> 360

      this.direction = {
        travel: 0, // 0 -> 359
        target: 0, // 0 -> 359
      };
      // TODO: SIMPLIFY LOGIC BY TURNING IN X degree increments PER MS?
    }

    turn(adjustment) {
      const previous = this.direction.travel;
      const adjusted = previous + adjustment;
      const targeted = adjusted % 360;
      // 
      // targeted could be negative currently, need to recalculate for below 0 : 360 - X

      this.direction.target = targeted;
    }

    move() {
      const n = Date.now();
      const ms = n - this.t;
      const d = DIST_PER_MS * ms;
      this.t = n;


      const turn_available = DEGS_PER_MS * ms;
      const turn_desirable = Math.min(turn_available);

      if () {
        // turn left
      }
      if () {
        // turn right
        this.direction.travel = this.direction.travel +=
      }
      this.direction.travel = this.target.travel + ()


      const turn_remaining_a = this.direction.target - this.direction.travel;
      const turn_remaining_b = this.direction.target - this.direction.travel;


      /**
       * TODO:
       * Project distance along a line based on steer direction vs current direction
       */
      this.x += d;
    }
  }

  const dx = Math.random() * canvas.width;
  const dy = Math.random() * canvas.height;
  const act = new Actor(dx, dy);

  const execute = (state, cdata) => {
    switch (state) {
      case STATE_TDEG:
        switch (cdata.direction) {
          case TOKEN_LDIR:
            act.turn(cdata.degrees * -1);
            break;
          case TOKEN_RDIR:
            act.turn(cdata.degrees);
            break;
        }
        break;
    }
  }

  const process = (tokens) => {
    let state = STATE_INIT;
    let cdata = {};

    for (let i = 0; i < tokens.length; i++) {
      const next = transition(state, tokens[i], cdata);

      if (accepts.has(next)) {
        execute(next, cdata);
        state = STATE_INIT;
        cdata = {};
        continue;
      }

      if (rejects.has(next)) {
        state = STATE_INIT;
        cdata = {};
        continue;
      }

      state = next;
    }
  };

  const r = new SpeechRecognition();

  r.continuous = true;
  r.lang = "en-US";
  r.interimResults = false;
  r.maxAlternatives = 1;


  r.onresult = evt => {
    process(evt.results[evt.resultIndex][0].transcript.trim().toLowerCase().split(" "));
  };


  r.onnomatch = console.warn;
  r.onerror = console.error;

  r.start();
  window.addEventListener('blur', () => r.stop());
  window.addEventListener('focus', () => r.start());



  const main = document.querySelector("main");
  const canvas = document.querySelector("canvas");


  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });


  /**
   * Snakes are just a represented by a list of pixels (x,y) which they should fill.
   * The list can grow longer.
   * 
   * The opacity of a pixel is determined by its place in the array.
   * 
   * We need O(1) deletes at the tail
   * We need O(1) appending at the head
   * 
   * If we make the snake object generic we can re-use it to draw NPC / Networked players
   * 
   * The directionality of the player snake should be stored separately.
   */



  window.dispatchEvent(new Event('resize'));


  class Node {
    constructor(x, y, incr) {
      this.x = x;
      this.y = y;
      this.incr = incr;
      this.prev = null;
      this.next = null;
    }
  }

  Node.connect = (f, s) => {
    f.next = s;
    s.prev = f;

    return f;
  }

  Node.disconnect = ({ prev: t }) => {
    t.next = null;

    return t;
  }

  class Entity {
    constructor(x, y) {
      this.incr = 0;
      this.size = 50;
      this.head = new Node(x, y, this.incr++);
      this.tail = this.head;
    }

    visit(x, y) {
      this.head = Node.connect(new Node(x, y, this.incr++), this.head);

      while ((this.head.incr - this.tail.incr) > this.size) {
        this.tail = Node.disconnect(this.tail);
      }
    }
  }



  let fps = 0;

  const ent = new Entity(dx, dy);

  const draw = () => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    act.move();
    ent.visit(Math.round(act.x), Math.round(act.y));

    let n = ent.head;
    while (n) {
      ctx.fillStyle = "rgba(255, 0, 0, 255)";
      ctx.fillRect(n.x, n.y, 1, 1);
      n = n.next;
    }

    fps++;
    window.requestAnimationFrame(draw);
  }

  window.requestAnimationFrame(draw);


  const frameCounter = document.querySelector("span[data-property=\"frames\"]");

  window.setTimeout(() => {
    frameCounter.innerHTML = fps;
    fps = 0;
  }, 1000);
})();