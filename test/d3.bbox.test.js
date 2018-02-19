import chai from 'chai';
import * as d3lb from '../d3.bbox.js'

var assert = chai.assert;

describe('_mouse_to_change_height', function() {
    it('should map mouse coordinates to change in height', function() {
        var dx = 3;
        var dy = 4;
        var rot = 30;

        var bbox = d3lb.bbox();
        var result = bbox._mouse_to_change_height(dx, dy, rot);

        assert.approximately(result, 4.598, 0.005);

    });
});
