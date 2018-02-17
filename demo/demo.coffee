import * as d3 from 'd3'
import * as d3lb from '../d3.bbox.js'

#document.addEventListener("DOMContentLoaded", makeDemo)

console.log 'demo'

#makeDemo = () ->
window.onload = () ->

    console.log 'making demo'

    [W, H] = [500, 500]

    d3.select("svg").attr
      width: W
      height: H

    d3.select("svg").append 'g'
      .attr transform: "translate(10,20)"

    rects = d3.select('g').selectAll 'rect'
      .data [{x: 20, y: 20, w: 40, h: 40},
             {x: 50, y: 90, w: 50, h: 60}]

    rects.exit().remove()
    rects.enter().append 'rect'

    console.log rects

    rects.attrs
      x: (d) -> d.x
      y: (d) -> d.y
      width: (d) -> d.w
      height: (d) -> d.h

    bb = d3lb.bbox().infect(rects)
    # Alternatively:
    #bb = d3lb.bbox()
    #rects.call bb

    (d3.select 'svg').on "mousemove", ->
      (document.getElementById "mouse").innerHTML = d3.mouse this

    # The rest is for the configuration boxes.
    #######

    # Control the cursor change
    (d3.select '#cursors').on "change", ->
      bb.cursors this.checked

    # Control the allowed directions
    dirs = x: on, y: on, w: on, nw: on, n: on, ne: on, e: on, sw: on, s: on, se: on
    (d3.selectAll '#x,#y,#w,#nw,#n,#ne,#e,#sw,#s,#se').on "change", ->
      dirs[this.id] = this.checked
      bb.directions (Object.keys dirs).filter (k) -> dirs[k]

    # Control the action radius
    (d3.select '#r').on "change", ->
      bb.handlesize +this.value
      d3.selectAll 'rect'
        .style "stroke-width": "#{this.value*2}px"

    # Control the vertical limits
    d3.select("svg>g").append 'line'
        .attr class: "ey", display: "none", x1: -10, x2: W, y1: H/2, y2: H/2
    d3.select("svg>g").append 'line'
        .attr class: "ey", display: "none", x1: -10, x2: W, y1: H/10, y2: H/10
    d3.select("svg>g").append 'line'
        .attr class: "ex", display: "none", x1: W/3, x2: W/3, y1: -20, y2: H
    d3.select("svg>g").append 'line'
        .attr class: "ex", display: "none", x1: W/1.2, x2: W/1.2, y1: -20, y2: H
    (d3.select '#ex').on "change", ->
        bb.xextent if this.checked then [W/3, W/1.2] else false
        (d3.selectAll 'line.ex').attr display: if this.checked then "initial" else "none"
    (d3.select '#ey').on "change", ->
        bb.yextent if this.checked then [H/10, H/2] else false
        (d3.selectAll 'line.ey').attr display: if this.checked then "initial" else "none"

    # The various event counters
    inc = (id, n) ->
      el = document.getElementById(id)
      el.innerHTML = ((parseFloat el.innerHTML) + (n ? 1)).toFixed if n? then 1 else 0
    bb.on "dragstart", (d, i) ->
      inc "dragstart"
      this._oldfill_ = this.style.fill
      this.style.fill = '#6BD1FB'
    bb.on "dragend", (d, i) ->
      inc "dragend"
      this.style.fill = this._oldfill_
      delete this._oldfill_
    bb.on "dragmove", (d, i) ->
      inc "dragmove"
      inc 'dragdist', Math.sqrt(d3.event.dx*d3.event.dx + d3.event.dy*d3.event.dy)
    bb.on "resizestart", (d, i) ->
      inc "resizestart"
      this._oldstroke_ = this.style.stroke
      this.style.stroke = '#6BD1FB'
    bb.on "resizeend", (d, i) ->
      inc "resizeend"
      this.style.stroke = this._oldstroke_
      delete this._oldstroke_
    bb.on "resizemove", (d, i) -> inc "resizemove"

    # Counters Firefox's weird checkbox cache.
    (d3.selectAll '#r').each -> this.value = 5
    (d3.selectAll '#x,#y,#w,#nw,#n,#ne,#e,#sw,#s,#se').each -> this.checked = true
    (d3.selectAll '#ex,#ey').each -> this.checked = false
