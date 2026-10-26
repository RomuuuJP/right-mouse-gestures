/* Pure, testable geometry/state machine; intentionally independent of Chrome APIs. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RMGEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const ACTIONS = Object.freeze({
    R: 'forward', L: 'back', U: 'scrollUp', D: 'scrollDown',
    UD: 'reload', DU: 'reload', DR: 'close', UL: 'tabLeft', UR: 'tabRight'
  });
  const DEFAULTS = Object.freeze({language:'zh-CN', sensitivity:60, activationDistance:12, turnDistance:14});
  const clamp = (num, min, max) => Math.max(min, Math.min(max, num));
  function normalize(input = {}) {
    return {
      language: ['zh-CN','ja','en'].includes(input.language) ? input.language : DEFAULTS.language,
      sensitivity: clamp(Number(input.sensitivity) || DEFAULTS.sensitivity, 1, 100),
      activationDistance: clamp(Number(input.activationDistance) || DEFAULTS.activationDistance, 6, 36),
      turnDistance: clamp(Number(input.turnDistance) || DEFAULTS.turnDistance, 7, 32)
    };
  }
  function minimumStroke(sensitivity) {
    return Math.round(53 - clamp(Number(sensitivity)||60, 1, 100) * 0.46); // 7..53px, 60 -> 25px
  }
  function direction(dx,dy,min,ratio=1.13) {
    if (Math.abs(dx) < min && Math.abs(dy) < min) return '';
    if (Math.abs(dx) >= min && Math.abs(dx) > Math.abs(dy) * ratio) return dx > 0 ? 'R' : 'L';
    if (Math.abs(dy) >= min && Math.abs(dy) > Math.abs(dx) * ratio) return dy > 0 ? 'D' : 'U';
    return '';
  }
  const reverse = { U:'D', D:'U', L:'R', R:'L' };
  class GestureRecognizer {
    constructor(options={}) { this.options=normalize(options); this.reset(); }
    configure(options) { this.options=normalize(options); }
    reset() { this.phase='idle'; this.start=null; this.tip=null; this.directions=[]; this.invalid=false; }
    press(x,y) { this.reset(); this.phase='pending'; this.start={x,y}; }
    move(x,y) {
      if (this.phase === 'idle') return this.snapshot();
      const pt={x,y};
      if (this.phase === 'pending') {
        if (Math.hypot(x-this.start.x,y-this.start.y) < this.options.activationDistance) return this.snapshot();
        this.phase='gesturing';
      }
      if (this.invalid) return this.snapshot();
      if (!this.directions.length) {
        const d=direction(x-this.start.x,y-this.start.y,minimumStroke(this.options.sensitivity));
        if (d) { this.directions.push(d); this.tip=pt; }
        return this.snapshot();
      }
      const previous=this.directions[this.directions.length-1];
      // The tip tracks the FURTHEST point in the active direction, not the position
      // where the direction was first recognized. Reversal thus needs only a short
      // retreat from the stroke's actual extremum.
      const dx=x-this.tip.x,dy=y-this.tip.y;
      const reversalDistance=Math.max(8,Math.round(this.options.turnDistance*0.78));
      const candidate=direction(dx,dy,Math.min(this.options.turnDistance,reversalDistance),1.14);
      if (candidate && candidate!==previous) {
        const required=candidate===reverse[previous] ? reversalDistance : this.options.turnDistance;
        const distance=(candidate==='U'||candidate==='D')?Math.abs(dy):Math.abs(dx);
        if(distance>=required){
          if (this.directions.length>=2) { this.invalid=true; this.directions.push(candidate); return this.snapshot(); }
          this.directions.push(candidate);this.tip=pt;return this.snapshot();
        }
      }
      // Update the tip only after checking perpendicular changes, so a slightly
      // rounded corner (rightward movement while still rising 1–3px) works.
      const along=previous==='U' ? this.tip.y-y : previous==='D' ? y-this.tip.y : previous==='L' ? this.tip.x-x : x-this.tip.x;
      if(along>0)this.tip=pt;
      return this.snapshot();
    }
    snapshot() {
      const key=this.directions.join('');
      return {phase:this.phase,key,action:this.phase==='gesturing' && !this.invalid ? ACTIONS[key]||null : null,invalid:this.invalid};
    }
    release() {const result=this.snapshot();this.reset();return result;}
  }
  return {GestureRecognizer,ACTIONS,DEFAULTS,normalize,minimumStroke,direction};
});
