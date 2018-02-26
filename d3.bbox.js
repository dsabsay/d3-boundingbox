// Copyright (c) 2015 Lucas Beyer
// Licensed under the MIT License (MIT)
// Version 1.0

//const d3 = require("d3");
import * as d3 from 'd3'

var root = (typeof module.exports !== "undefined" && module.exports !== null)
    ? module.exports : this
if (!root.d3lb) {
    root.d3lb = {}
}

root.bbox = function () {
    // All those are initialized to default further down using the setters.
    var xextent = null
    var yextent = null
    var handlesize = null
    var dirs = null
    var curs = null
    var cbs = {
        dragstart: null,
        dragmove: null,
        dragend: null,
        resizestart: null,
        resizemove: null,
        resizeend: null
    }
    var _svg = null;
    var _translate_g = null;
    var _rotate_g = null;
    var _translate_x = 0;
    var _translate_y = 0;
    var _rotate_deg = 0;
    var _width = null;
    var _height = null;

    function my(selection) {

        console.log('selection: ', selection)

        // add the translate group
        selection.each(function() {
            var el = this;
            _translate_g = d3.select(el.parentNode)
                .insert('g')
                .classed('bbox-translate', true);

            _rotate_g = _translate_g
                .insert('g')
                .classed('bbox-rotate', true);

            _rotate_g
                .append(function() { return el; });
        });

        // test the rotation
        _width = +selection.attr('width');
        _height = +selection.attr('height');

        _rotate({deg: 390});

        // Capture the parent SVG element.
        var element = selection.node();
        while (element.tagName.toLowerCase() !== 'svg') {
            element = element.parentElement;
        }
        _svg = element;

        //var drag = d3.behavior.drag()
        // drag behavior renamed in D3 v4
        var drag = d3.drag()
            //.origin(function(d, i) { return {x: this.getAttribute("x"), y: this.getAttribute("y")}; })
            // .origin replaced with .subject in D3 v4
            //.subject(function(d, i) { return {x: this.getAttribute("x"), y: this.getAttribute("y")}; })
            .container(_svg)
            .subject(function(d, i) {
                return {
                    x: _translate_x,
                    y: _translate_y
                };
            })
            .on("drag.lbbbox", dragmove)
            .on("start.lbbbox", dragstart)
            .on("end.lbbbox", dragend);

        selection.call(drag);
        selection.on("mousemove.lbbbox", move);
        selection.on("mouseleave.lbbbox", leave);

        return selection
    }

    function clamp(x, extent) { return Math.max(extent[0], Math.min(x, extent[1])); }
    function inside(x, extent) { return extent[0] < x && x < extent[1]; }

    // Will return w, nw, n, ne, e, se, s, sw for the eight borders,
    // M for inside, or "" when current location not in `dirs`.
    function whichborder(xy, elem) {
        var border = ""
        var x = +elem.getAttribute("x")
        var y = +elem.getAttribute("y")
        var w = +elem.getAttribute("width")
        var h = +elem.getAttribute("height")

             if(xy[1] < y + handlesize.n) border += 'n'
        else if(xy[1] > y + h - handlesize.s) border += 's'

             if(xy[0] < x + handlesize.w) border += 'w'
        else if(xy[0] > x + w - handlesize.e) border += 'e'


        if(border == "" && (dirs.indexOf("x") > -1 || dirs.indexOf("y") > -1))
            border = "M"
        else if(dirs.indexOf(border) == -1)
            border = ""

        return border
    }

    function move(d, i) {
        // Don't do anything if we're currently dragging.
        // Otherwise, the cursor might jump horribly!
        // Also don't do anything if no cursors.
        if(this.__resize_action__ !== undefined || !curs)
            return

        var b = whichborder(d3.mouse(this), this)

        var x = dirs.indexOf("x")
        var y = dirs.indexOf("y")
        // Bwahahahaha this works even when one is at index 0.
        if(b == "M" && 1/(x*y) < 0)
            document.body.style.cursor = x >= 0 ? curs.x : curs.y
        else
            document.body.style.cursor = curs[b] || null
    }

    function leave(d, i) {
        // Only unset cursor if we're not dragging,
        // otherwise we get horrible cursor-flipping action.
        // Also only unset it if we actually did set it!
        if(this.__resize_action__ === undefined && curs)
            document.body.style.cursor = null
    }

    function dragstart(d, i) {
        this.__resize_action__ = whichborder(d3.mouse(this), this)
        this.__ow__ = +this.getAttribute("width")
        this.__oh__ = +this.getAttribute("height")

        if(this.__resize_action__ == "M") {
            if(cbs.dragstart) cbs.dragstart.call(this, d, i)
        } else if(this.__resize_action__.length) {
            if(cbs.resizestart) cbs.resizestart.call(this, d, i)
        }
    }

    function dragend(d, i) {
        if(this.__resize_action__ == "M") {
            if(cbs.dragend) cbs.dragend.call(this, d, i)
        } else if(this.__resize_action__.length) {
            if(cbs.resizeend) cbs.resizeend.call(this, d, i)
        }

        delete this.__resize_action__
        delete this.__ow__
        delete this.__oh__

        // Still need to unset here, in case the user stop dragging
        // while the mouse isn't on the element anymore (e.g. off-limits).
        if(curs)
            document.body.style.cursor = null
    }

    /* Translates the bounding box. 
     *
     * NOTE: Currently, this doesn't implement extent constraints.
     */
    function _translate({x = _translate_x, y = _translate_y} = {}) {
        _translate_x = x;
        _translate_y = y;

        _translate_g.attr('transform',
                'translate(' + _translate_x + ',' + _translate_y + ')');
    }

    /* Rotates the bounding box.
     *
     * NOTE: may need to restric to 0 <= deg <= 360 ?
     */
    function _rotate({deg = _rotate_deg} = {}) {
        _rotate_deg = deg;

        _rotate_g.attr('transform',
                'rotate(' + _rotate_deg + ',' +
                    (_width / 2) + ',' + (_height / 2) + ')');
    }

    /* Converts degrees to radians. */
    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    /* Computes the angle between vectors.
     *
     * Vectors should be of the form [x, y].
     */
    function angleBetweenVectors(a, b) {
        // Compute dot product
        const aDotB = (a[0] * b[0]) + (a[1] * b[1]);

        // Get vector magnitudes.
        const magA = Math.sqrt((a[0] ** 2) + (a[1] ** 2));
        const magB = Math.sqrt((b[0] ** 2) + (b[1] ** 2));

        const theta = Math.acos(aDotB / (magA * magB));

        return theta;
    }

    /* Returns the dot product of the 2D vectors a and b.
     *
     * Vectors should be of the form [x, y].
     */
    function dotProduct(a, b) {
        return (a[0] * b[0]) + (a[1] * b[1]);
    }

    /* Maps changes in mouse coordinates (dx, dy) in unrotated coordinate space
     * to a change in distance along a normal vector that is rotated by rot
     * degrees from 0 in the clockwise direction.
     */
    function _mouse_to_change_normal(dx, dy, rot) {
        // y-component is negated because the y-axis is oriented with
        // negative y pointing in the upward direction.
        const normal = [1 * Math.sin(toRadians(rot)), -1 * Math.cos(toRadians(rot))];

        // When the length of normal is 1, the equation
        //      dh = mag(mouse) * cos(alpha)
        // where mouse = [dx, dy], can be simplified to
        //      dh = dotProduct(mouse, normal).
        const d_height = dotProduct([dx, dy], normal);

        return d_height;
    }

    /* Computes the translation necessary when the box is resized.
     * Returns the x- and y-components of the normal vector.
     *
     * dn = length of normal vector
     * rot = angle in degrees by which the normal vector is rotated from 0
     *       in the clockwise direction
     */
    function _get_translate_for_change_normal(dn, rot) {

        // Get angle between normal and positive x-axis.
        const omega = toRadians(90) - toRadians(rot);

        // scalar projection of normal onto positive x-axis
        const tdx = dn * Math.cos(omega);

        // equivalent to scalar projection of normal onto positive y-axis
        const tdy =  - dn * Math.sin(omega);

        return [tdx, tdy];
    }

    function dragmove(d, i) {
        if(this.__resize_action__ == "M") {
            if(cbs.dragmove)
                if(false === cbs.dragmove.call(this, d, i))
                    return
        } else if(this.__resize_action__.length) {
            if(cbs.resizemove)
                if(false === cbs.resizemove.call(this, d, i))
                    return
        }

        // Potentially dynamically determine the allowed space.
        var xext = typeof xextent === "function" ? xextent.call(this, d, i) : xextent
        var yext = typeof yextent === "function" ? yextent.call(this, d, i) : yextent

        // Handle moving around first, more easily.
        if(this.__resize_action__ == "M") {

            var x = _translate_x;
            var y = _translate_y;

            if(dirs.indexOf("x") > -1 && d3.event.dx != 0)
                // This is so that even moving the mouse super-fast,
                // this still "sticks" to the extent.
                x = clamp(clamp(d3.event.x, xext) + this.__ow__, xext)
                    - this.__ow__

            if(dirs.indexOf("y") > -1 && d3.event.dy != 0)
                y = clamp(clamp(d3.event.y, yext) + this.__oh__, yext)
                    - this.__oh__

            _translate({x: x, y: y});

        // Now check for all possible resizes.
        // TODO: maybe this needs to be a separate drag event with a different
        //       container defined on the drag behavior. The container should be
        //       the rect itself.
        } else {
            var x = +this.getAttribute("x")
            //var y = +this.getAttribute("y")
            var y = _translate_y

            // First, check for vertical resizes,
            if(/^n/.test(this.__resize_action__)) {

                /*
                var b = y + +this.getAttribute("height")
                //var newy = clamp(clamp(d3.event.y, yext), [-Infinity, b-1])
                var newy = clamp(clamp(d3.event.y, yext) + this.__oh__, yext)
                    - this.__oh__;
                console.log('newy: ', newy);
                //this.setAttribute("y", newy)

                // Need to factor the angle of rotation into the translation!
                // In other words, need to translate a little in both x and y,
                // based on the angle of rotation.
                _translate({y: newy});
                _rotate();
                _height = b - newy;
                //this.setAttribute("height", b - newy)
                this.setAttribute("height", _height);
                */

                ////////////////

                /* Compute height change based on how far the mouse moved along
                 * the rotated y-axis of the _rotate_g element.
                 */
                //var dx = d3.event.x - _translate_x;
                //var dy = d3.event.y - _translate_y;
                const dx = d3.event.dx;
                const dy = d3.event.dy;
                //var dh = Math.sqrt((dx ** 2) + (dy ** 2));
                const dh = _mouse_to_change_normal(dx, dy, _rotate_deg);

                // Don't allow resizing to 0.
                if (_height + dh <= 0) {
                    return;
                }

                _height += dh;
                this.setAttribute("height", _height);

                /* Apply translation to keep box in the same position.
                 * This determines what translation to apply to the un-rotated
                 * _translate_g element in order to compensate for the change
                 * in height of the bounding box.
                 */
                //var dx_translate = dh * Math.cos(toRadians(_rotate_deg));
                //var dy_translate = dh * Math.sin(toRadians(_rotate_deg));
                const d_translate = _get_translate_for_change_normal(dh, _rotate_deg);
                const dx_translate = d_translate[0];
                const dy_translate = d_translate[1];

                console.log('dx_translate: ', dx_translate);
                console.log('dh: ', dh);
                console.log('dx: ', dx);
                console.log('d3.event.x: ', d3.event.x);

                //_rotate();
                _translate({x: _translate_x + dx_translate,
                            y: _translate_y + dy_translate});

            } else if(/^s/.test(this.__resize_action__)) {
                // NOTE: The border is determined in whichborder().

                /*
                var b = clamp(d3.event.y + this.__oh__, yext)
                this.setAttribute("height", clamp(b - y, [1, Infinity]))
                */
                const dx = d3.event.dx;
                const dy = d3.event.dy;
                const dh = _mouse_to_change_normal(dx, dy, _rotate_deg + 180);

                // Don't allow resizing to 0.
                if (_height + dh <= 0) {
                    return;
                }

                _height += dh;
                this.setAttribute("height", _height);
            }

            // and then for horizontal ones. Note both may happen.
            if(/w$/.test(this.__resize_action__)) {
                /*
                var r = x + +this.getAttribute("width")
                var newx = clamp(clamp(d3.event.x, xext), [-Infinity, r-1])
                this.setAttribute("x", newx)
                this.setAttribute("width", r - newx)
                */

                const dx = d3.event.dx;
                const dy = d3.event.dy;
                const dw = _mouse_to_change_normal(dx, dy, _rotate_deg + 270);

                // Don't allow resizing to 0.
                if (_width + dw <= 0) {
                    return;
                }

                _width += dw;
                this.setAttribute("width", _width);

                const d_translate = _get_translate_for_change_normal(dw, _rotate_deg + 270);
                const dx_translate = d_translate[0];
                const dy_translate = d_translate[1];

                //_rotate();
                _translate({x: _translate_x + dx_translate,
                            y: _translate_y + dy_translate});

            } else if(/e$/.test(this.__resize_action__)) {
                // NOTE: Translation is unnecessary here because the border is
                //       determined solely by x, y mouse coordinates in
                //       non-rotated coordinate space (so, rotation by 180
                //       degrees, for example would still work).
                
                /*
                var r = clamp(d3.event.x + this.__ow__, xext)
                this.setAttribute("width", clamp(r - x, [1, Infinity]))
                */
                
                const dx = d3.event.dx;
                const dy = d3.event.dy;
                const dw = _mouse_to_change_normal(dx, dy, _rotate_deg + 90);
                
                // Don't allow resizing to 0.
                if (_width + dw <= 0) {
                    return;
                }

                _width += dw;
                this.setAttribute("width", _width);
            }
        }
    }

    my.xextent = function(_) {
        if(!arguments.length) return xextent
        xextent = _ !== false ? _ : [-Infinity, +Infinity]
        return my
    }
    my.xextent(false)

    my.yextent = function(_) {
        if(!arguments.length) return yextent
        yextent = _ !== false ? _ : [-Infinity, +Infinity]
        return my
    }
    my.yextent(false)

    my.handlesize = function(_) {
        if(!arguments.length) return handlesize
        handlesize = !+_ ? _ : {'w': _,'n': _,'e': _,'s': _}  // coolface
        return my
    }
    my.handlesize(3)

    my.cursors = function(_) {
        if(!arguments.length) return curs
        curs = _ !== true ? _ : {
            M: "move",
            x: "col-resize",
            y: "row-resize",
            n: "n-resize",
            e: "e-resize",
            s: "s-resize",
            w: "w-resize",
            nw: "nw-resize",
            ne: "ne-resize",
            se: "se-resize",
            sw: "sw-resize"
        }
        return my
    }
    my.cursors(true)

    my.directions = function(_) {
        if(!arguments.length) return dirs
        dirs = _ !== true ? _ : ["n", "e", "s", "w", "nw", "ne", "se", "sw", "x", "y"]
        return my
    }
    my.directions(true)

    my.on = function(name, cb) {
        if(cb === undefined) return cbs[name]
        cbs[name] = cb
        return my
    }

    my.infect = function(selection) {
        selection.call(my)
        return my
    }

    my.disinfect = function(selection) {
        selection.on(".drag", null)
        selection.on(".lbbbox", null)
        return my
    }

    /* Expose function to tests. */
    my._mouse_to_change_normal = _mouse_to_change_normal;
    my._get_translate_for_change_normal = _get_translate_for_change_normal;
    my.angleBetweenVectors = angleBetweenVectors;
    my.dotProduct = dotProduct;
    /* End exposing to tests. */

    return my
}
