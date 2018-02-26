import chai from 'chai';
import * as d3lb from '../d3.bbox.js'

var assert = chai.assert;

describe('_mouse_to_change_normal', function() {
    it('change height: 1st quadrant', function() {
        var dx = 4;
        var dy = -3; // account for inverted y-axis
        var rot = 30;
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        var result = bbox._mouse_to_change_normal(dx, dy, rot);

        assert.approximately(result, 4.598, delta);
    });

    it('change height: 2nd quadrant', function() {
        const dx = -2.5;
        const dy = -4; // y-axis is inverted
        const rot = 30;
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        var result = bbox._mouse_to_change_normal(dx, dy, rot);

        assert.approximately(result, 2.2141, delta)
    });

    it('change height: 3rd quadrant', function() {
        const dx = -2.5;
        const dy = 7; // y-axis is inverted
        const rot = 30;
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        var result = bbox._mouse_to_change_normal(dx, dy, rot);

        assert.approximately(result, -7.3122, delta)
    });

    it('change height: 4th quadrant', function() {
        const dx = 5;
        const dy = 8.3; // y-axis is inverted
        const rot = 30;
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        var result = bbox._mouse_to_change_normal(dx, dy, rot);

        assert.approximately(result, -4.6880, delta)
    });

    it('all parameters are floating point numbers', function() {
        const dx = 3.222;
        const dy = -0.98;
        const rot = 210.546;
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        var result = bbox._mouse_to_change_normal(dx, dy, rot);

        assert.approximately(result, -2.4815, delta);
    });


});

describe('_get_translate_for_change_normal', function() {
    it('should map a change in height to the compensatory translation', function() {
        const dh = 4.598;
        const rot = 30;
        const expected = [2.299, -3.982];
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        const result = bbox._get_translate_for_change_normal(dh, rot);

        assert.equal(result.length, expected.length);
        assert.approximately(result[0], expected[0], delta);
        assert.approximately(result[1], expected[1], delta);
    });

    it('westerly resize', function() {
        const dn = 5.75;
        const rot = 35.5 + 270;
        const expected = [-4.6812, -3.3390];
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        const result = bbox._get_translate_for_change_normal(dn, rot);

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
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        const result = bbox.angleBetweenVectors(v1, v2);

        assert.approximately(result, expected, delta);
    });

});

describe('dotProduct', function() {
    it('should compute the dot product', function() {
        const a = [1, 1];
        const b = [0, -1];

        const expected = -1;

        var bbox = d3lb.bbox();
        const result = bbox.dotProduct(a, b);

        assert.equal(result, expected);
    });

    it('should compute the dot product', function() {
        const a = [-5, 2.5];
        const b = [1, 20.2];

        const expected = 45.5;
        const delta = 0.0005;

        var bbox = d3lb.bbox();
        const result = bbox.dotProduct(a, b);

        assert.approximately(result, expected, delta);
    });

});

