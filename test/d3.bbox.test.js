import chai from 'chai';
import * as d3lb from '../d3.bbox.js'

var assert = chai.assert;

describe('_mouse_to_change_height', function() {
    it('should map mouse coordinates to change in height', function() {
        var dx = 4;
        var dy = 3;
        var rot = 30;

        var bbox = d3lb.bbox();
        var result = bbox._mouse_to_change_height(dx, dy, rot);

        assert.approximately(result, 4.598, 0.005);

    });
});

describe('_get_translate_for_change_height', function() {
    it('should map a change in height to the compensatory translation', function() {
        const dh = 4.598;
        const rot = 30;
        const expected = [2.299, 3.982];
        const delta = 0.005;

        var bbox = d3lb.bbox();
        const result = bbox._get_translate_for_change_height(dh, rot);

        assert.equal(result.length, expected.length);
        assert.approximately(result[0], expected[0], delta);
        assert.approximately(result[1], expected[1], delta);
    });
});

describe('angleBetweenVectors', function() {
    it('should compute angle between two vectors', function() {
        const v1 = [1, 1];
        const v2 = [-1, 0];

        const expected = 135 * (Math.PI / 180);

        var bbox = d3lb.bbox();
        const result = bbox.angleBetweenVectors(v1, v2);

        assert.equal(result, expected);
    });

    it('should compute angle between two vectors', function() {
        const v1 = [1, 1];
        const v2 = [1, 0];

        const expected = 45 * (Math.PI / 180);
        const delta = 0.005;

        var bbox = d3lb.bbox();
        const result = bbox.angleBetweenVectors(v1, v2);

        assert.approximately(result, expected, delta);
    });

});


