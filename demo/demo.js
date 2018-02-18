import * as d3 from 'd3'
import 'd3-selection-multi'
import * as d3lb from '../d3.bbox.js'

window.onload = makeDemo

function makeDemo() {

    console.log('in makeDemo');

    const [W, H] = Array.from([500, 500]);

    d3.select("svg").attrs({
      width: W,
      height: H
    });

    /*
    d3.select("svg").append('g')
      .attrs({transform: "translate(10,20)"});
  */

    //var rects = d3.select('g').selectAll('rect')
    var rects = d3.select('svg').selectAll('rect')
      .data([{x: 0, y: 0, w: 40, h: 40}])
      //.data([{x: 20, y: 20, w: 40, h: 40},
      //       {x: 50, y: 90, w: 50, h: 60}])
      .enter()
      .append('rect');

    // rects.exit().remove()

    rects.attrs({
      x: function(d) { return d.x; },
      y: function(d) { return d.y; },
      width: function(d) { return d.w; },
      height: function(d) { return d.h; }
    });

    console.log(rects);

    //const bb = d3lb.bbox().infect(rects);
    var bb = d3lb.bbox().infect(rects);

    // Alternatively:
    //bb = d3lb.bbox()
    //rects.call bb

    (d3.select('svg')).on("mousemove", function() {
      return (document.getElementById("mouse")).innerHTML = d3.mouse(this);
    });

    // The rest is for the configuration boxes.
    //######

    // Control the cursor change
    (d3.select('#cursors')).on("change", function() {
      return bb.cursors(this.checked);
    });

    // Control the allowed directions
    const dirs = {x: true, y: true, w: true, nw: true, n: true, ne: true, e: true, sw: true, s: true, se: true};
    (d3.selectAll('#x,#y,#w,#nw,#n,#ne,#e,#sw,#s,#se')).on("change", function() {
      dirs[this.id] = this.checked;
      return bb.directions((Object.keys(dirs)).filter(k => dirs[k]));
    });

    // Control the action radius
    (d3.select('#r')).on("change", function() {
      bb.handlesize(+this.value);
      return d3.selectAll('rect')
        .style({"stroke-width": `${this.value*2}px`});
    });

    // Control the vertical limits
    d3.select("svg>g").append('line')
        .attrs({class: "ey", display: "none", x1: -10, x2: W, y1: H/2, y2: H/2});
    d3.select("svg>g").append('line')
        .attrs({class: "ey", display: "none", x1: -10, x2: W, y1: H/10, y2: H/10});
    d3.select("svg>g").append('line')
        .attrs({class: "ex", display: "none", x1: W/3, x2: W/3, y1: -20, y2: H});
    d3.select("svg>g").append('line')
        .attrs({class: "ex", display: "none", x1: W/1.2, x2: W/1.2, y1: -20, y2: H});
    (d3.select('#ex')).on("change", function() {
        bb.xextent(this.checked ? [W/3, W/1.2] : false);
        return (d3.selectAll('line.ex')).attrs({display: this.checked ? "initial" : "none"});
    });
    (d3.select('#ey')).on("change", function() {
        bb.yextent(this.checked ? [H/10, H/2] : false);
        return (d3.selectAll('line.ey')).attrs({display: this.checked ? "initial" : "none"});
    });

    // The various event counters
    const inc = function(id, n) {
      const el = document.getElementById(id);
      return el.innerHTML = ((parseFloat(el.innerHTML)) + (n != null ? n : 1)).toFixed((n != null) ? 1 : 0);
    };
    bb.on("dragstart", function(d, i) {
      inc("dragstart");
      this._oldfill_ = this.style.fill;
      return this.style.fill = '#6BD1FB';
    });
    bb.on("dragend", function(d, i) {
      inc("dragend");
      this.style.fill = this._oldfill_;
      return delete this._oldfill_;
    });
    bb.on("dragmove", function(d, i) {
      inc("dragmove");
      return inc('dragdist', Math.sqrt((d3.event.dx*d3.event.dx) + (d3.event.dy*d3.event.dy)));
    });
    bb.on("resizestart", function(d, i) {
      inc("resizestart");
      this._oldstroke_ = this.style.stroke;
      return this.style.stroke = '#6BD1FB';
    });
    bb.on("resizeend", function(d, i) {
      inc("resizeend");
      this.style.stroke = this._oldstroke_;
      return delete this._oldstroke_;
    });
    bb.on("resizemove", (d, i) => inc("resizemove"));

    // Counters Firefox's weird checkbox cache.
    (d3.selectAll('#r')).each(function() { return this.value = 5; });
    (d3.selectAll('#x,#y,#w,#nw,#n,#ne,#e,#sw,#s,#se')).each(function() { return this.checked = true; });
    (d3.selectAll('#ex,#ey')).each(function() { return this.checked = false; });

}
