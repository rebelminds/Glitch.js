;(function () {
	'use strict';

	/**
	 * Description 
	 *
	 * @copyright Rebel Minds [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/**
	 * Instantiate glitch listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function Glitch(layer, options) {

		var options = options || {};

		/**
		 * The Glitch layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * Target HEX to glitch.
		 *
		 * @type String (hex)
		 */
		 this.target = options.target || '#FFFFFF';

		 /**
		 * Frequency of glitch.
		 *
		 * @type Number (int)
		 */
		 this.frequency = options.frequency || 5;

		 /**
		 * Initial delay of first glitch.
		 *
		 * @type Number (int)
		 */
		 this.delay = options.delay || 0;

		 /**
		 * Collection of elements to Glitch
		 *
		 * @type Array
		 */
		 this.collection = this.collect(this.layer, this.target);

		 /**
		 * 
		 *
		 */
		var self = this,
			t;

		 t = setTimeout(function() {

		 	clearTimeout(t);

		 	self.glitch();
		 }, this.delay);
	}

	Glitch.prototype.glitch = function() {

		for (var i = 0; i < this.collection.length; i++) {

		 	var el = this.collection[i];

		 	this.add(el);
		 }
	}

	Glitch.prototype.collect = function(layer, target) {

		var tl = [],
			te = layer.getElementsByTagName('*'); //document.body.getElementsByTagName("*");

		for (var i = 0; i < te.length; i++) {

			var el = te[i];

			if(!el) continue;

			var computedStyle = window.getComputedStyle(el, null),
				color = computedStyle.getPropertyValue('color'),
				backgroundColor = computedStyle.getPropertyValue('background-color'),
				borderColor = computedStyle.getPropertyValue('border-color');

			//console.log(el.tagName, color, backgroundColor, borderColor);
			
			if(!this.isHex(color)) color = this.rgbToHex(color);
			if(!this.isHex(backgroundColor)) backgroundColor = this.rgbToHex(backgroundColor);
			if(!this.isHex(borderColor)) borderColor = this.rgbToHex(borderColor);

			//console.log(c);	

			if( color.toUpperCase() === this.target ||
				backgroundColor.toUpperCase() === this.target ||
				borderColor.toUpperCase() === this.target ) tl.push(el);
		}

		return tl;
	}

	Glitch.prototype.rgbToHex = function(rgb) {

		rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

 		return '#' + this.hex(rgb[1]) + this.hex(rgb[2]) + this.hex(rgb[3]);
	}

	Glitch.prototype.hex = function(v) {

		var hexDigits = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

		return isNaN(v) ? '00' : hexDigits[(v - v % 16) / 16] + hexDigits[v % 16];
	}

	Glitch.prototype.isHex = function(v) {

		return v.match(/^[0-9A-Fa-f]+$/);
	}

	Glitch.prototype.add = function(el) {

		var displace = this.displace(el);

		el.parentNode.style.overflow = 'visible';
		el.parentNode.appendChild(displace);

		el.style.opacity = 0;
	}

	Glitch.prototype.displace = function(el) {

		var computedStyle = window.getComputedStyle(el, null);

		var d = {

			w: el.offsetWidth,
			h: el.offsetHeight,
			x: el.offsetLeft,
			y: el.offsetTop,
			style: {
				color: computedStyle.getPropertyValue('color'),
				backgroundColor: computedStyle.getPropertyValue('background-color'),
				borderColor: computedStyle.getPropertyValue('border-color')
			}
		};

		var displace = document.createElement('DIV');

		displace.style.position = 'absolute';
		displace.style.overflow = 'visible';
		displace.style.width = d.w + 'px';
		displace.style.height = d.h + 'px';
		displace.style.left = d.x + 'px';
		displace.style.top = d.y + 'px';

		var rgbSplit = this.rgbSplit(el, d);

		displace.appendChild(rgbSplit);

		var topSlice = this.displaceSlice(el, d,'top');

		displace.appendChild(topSlice);

		var bottomSlice = this.displaceSlice(el, d,'bottom');

		displace.appendChild(bottomSlice);

		return displace;
	}

	Glitch.prototype.displaceSlice = function(el, d, position) {

		var offsetX = Math.floor(d.w * .05),
			offsetY = Math.ceil(d.h * .5),
			slice = document.createElement('DIV');

		slice.style.position = 'absolute';
		slice.style.overflow = 'hidden';
		slice.style.width = d.w + 'px';
		slice.style.height = offsetY + 'px';
		slice.style.left = (position === 'top' ? -offsetX : offsetX) + 'px';
		slice.style.top = (position === 'top' ? 0 : offsetY) + 'px';

		var clone = el.cloneNode(true);

		clone.style.position = 'absolute';
		clone.style.top = (position === 'top' ? 0 : -offsetY) + 'px';

		slice.appendChild(clone);

		return slice
	}

	Glitch.prototype.rgbSplit = function(el, d) {

		var offsetX = Math.floor(d.w * .075),
			offsetY = Math.floor(d.h * .05),
			split = document.createElement('DIV');

		var red = this.split(el, d, -offsetX, offsetY, '#FF00FF');

		split.appendChild(red);

		var blue = this.split(el, d, offsetX, -offsetY, '#00FFFF');

		split.appendChild(blue);

		return split;
	}

	Glitch.prototype.split = function(el, d, offsetX, offsetY, hex) {

		var split = el.cloneNode(true);

		split.style.position = 'absolute';

		var color = d.style.color;

		if(!this.isHex(color)) color = this.rgbToHex(color);

		if(color.toUpperCase() === this.target) split.style.color = hex;
		
		var backgroundColor = d.style.backgroundColor;

		if(!this.isHex(backgroundColor)) backgroundColor = this.rgbToHex(backgroundColor);

		if(backgroundColor.toUpperCase() === this.target) split.style.backgroundColor = hex;
		
		var borderColor = d.style.borderColor;

		if(!this.isHex(borderColor)) borderColor = this.rgbToHex(borderColor);
		
		if(borderColor.toUpperCase() === this.target) split.style.borderColor = hex;

		split.style.left = -offsetX + 'px';
		split.style.top = offsetY + 'px';

		return split;
	}

	Glitch.prototype.remove = function(el) {
		
	}

	/**
	 * Factory method for creating a Glitch object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	Glitch.attach = function(layer, options) {
		
		return new Glitch(layer, options);
	}

	Glitch.detach = function() {


	}

	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return Glitch;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Glitch.attach;
		module.exports.Glitch = Glitch;
	} else {
		window.Glitch = Glitch;
	}
}());