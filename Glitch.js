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
		this.frequency = options.frequency || 1.5;

		/**
		 * Offset amount for displace and rgb split.
		 *
		 * @type Number (int)
		 */
		this.offset = 2;

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
		 * Initialize Glitch with delay of this.delay
		 *
		 */
		var self = this,
			t;

		 t = setTimeout(function() {

		 	clearTimeout(t);

		 	self.glitch();
		 }, this.delay);
	}

	/**
	 * Scan layer and collect elements with target hex
	 *
	 * @param {Element} layer - DOM Element
	 * @param {Number} target - 
	 *
	 * returns {Array} tl - 
	 */
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
			
			if(!this.isHex(color)) color = this.rgbToHex(color);
			if(!this.isHex(backgroundColor)) backgroundColor = this.rgbToHex(backgroundColor);
			if(!this.isHex(borderColor)) borderColor = this.rgbToHex(borderColor);

			var propreties = {
				color: color.toUpperCase() === this.target ? color : false,
				backgroundColor: backgroundColor.toUpperCase() === this.target ? backgroundColor : false,
				borderColor: borderColor.toUpperCase() === this.target ? borderColor : false
			};

			if( propreties.color !== false ||
				propreties.backgroundColor !== false ||
				propreties.borderColor !== false ) tl.push({
					el: el,
					propreties: propreties,
					placement: {
						width: el.offsetWidth,
						height: el.offsetHeight,
						left: el.offsetLeft,
						top: el.offsetTop
					}
				});
		}

		return tl;
	}

	/**
	 * Glitch each element in collection
	 *
	 */
	Glitch.prototype.glitch = function() {

		for (var i = 0; i < this.collection.length; i++) {

		 	var collection = this.collection[i];

		 	if(collection.glitch) this.remove(collection.glitch);

		 	var glitch = this.add(collection),
		 		parentNode = this.collection[i].el.parentNode;

		 	parentNode.style.overflow = 'visible';

			parentNode.appendChild(glitch.el);

			this.collection[i].el.style.opacity = 0;

			this.collection[i].glitch = glitch;

			console.log(glitch);
		 }
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 *
	 * returns {Object} glitch - 
	 */
	Glitch.prototype.add = function(collection) {

		var parentComputedStyle = window.getComputedStyle(collection.el.parentNode),
			parentTop = parentComputedStyle.getPropertyValue('top'),
			parentLeft = parentComputedStyle.getPropertyValue('left');

		var glitch = document.createElement('DIV'),

			rgbSplit = this.rgbSplit(collection),
			displace = this.displace(collection);

		glitch.style.position = 'absolute';
		glitch.style.overflow = 'visible';
		glitch.style.width = collection.placement.width + 'px';
		glitch.style.height = collection.placement.height + 'px';
		glitch.style.top = (isNaN(parentTop) ? collection.placement.top : collection.placement.top + parentTop) + 'px';
		glitch.style.left = (isNaN(parentLeft) ? collection.placement.left : collection.placement.left + parentLeft) + 'px';

		glitch.appendChild(rgbSplit);
		glitch.appendChild(displace);

		return {el: glitch, rgbSplit: rgbSplit, displace: displace};
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 */
	Glitch.prototype.remove = function(glitch) {
		
		glitch.el.parentNode.removeChild(glitch.el);

		delete collection.glitch;
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 *
	 * returns {Object} displace - 
	 */
	Glitch.prototype.displace = function(collection) {

		var displace = document.createElement('DIV');

		displace.style.position = 'absolute';
		displace.style.overflow = 'visible';
		displace.style.width = collection.placement.width + 'px';
		displace.style.height = collection.placement.height + 'px';
		displace.style.top = '0px';
		displace.style.left = '0px';

		var slices = Math.ceil(collection.placement.height / 15);

		for (var i = 0; i < slices; i++) {

			var slice = this.displaceSlice(collection, [i, slices]);

			displace.appendChild(slice);
		}

		return displace;
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 * @param {Array} position - 
	 *
	 * returns {Object} slice - 
	 */
	Glitch.prototype.displaceSlice = function(collection, position) {

		var slice = document.createElement('DIV'),

			offsetX = Math.floor(Math.random() * (this.offset * this.frequency + 1)) + this.offset,
			offsetY = Math.ceil(collection.placement.height / position[1]),
			isOdd = this.isOdd(position[0]);

		slice.style.position = 'absolute';
		slice.style.overflow = 'hidden';
		slice.style.width = collection.placement.width + 'px';
		slice.style.height = offsetY + 'px';
		slice.style.left = (isOdd ? -offsetX : offsetX) + 'px';
		slice.style.top = (position[0] * offsetY) + 'px';

		var clone = collection.el.cloneNode(true);

		clone.style.position = 'absolute';
		clone.style.top = -(position[0] * offsetY) + 'px';
		clone.style.left = '0px';

		slice.appendChild(clone);

		return slice
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 *
	 * returns {Object} rgbSplit - 
	 */
	Glitch.prototype.rgbSplit = function(collection) {

		var rgbSplit = document.createElement('DIV'),
			offset = this.channelOffset();

		rgbSplit.style.overflow = 'visible';
		rgbSplit.style.width = collection.placement.width + 'px';
		rgbSplit.style.height = collection.placement.height + 'px';

		var red = this.rgbChannel(collection, -offset[0], offset[1], '#FF00FF');

		rgbSplit.appendChild(red);

		/*
		var green = this.rgbChannel(collection, offset[0], offset[1], '#FFFF00');

		rgbSplit.appendChild(green);
		*/
		
		var blue = this.rgbChannel(collection, offset[0], -offset[1], '#00FFFF');

		rgbSplit.appendChild(blue);

		return rgbSplit;
	}

	/**
	 * 
	 *
	 * returns {Array}  
	 */
	Glitch.prototype.channelOffset = function() {

		var offsetX = Math.floor(Math.random() * (this.offset * this.frequency + 1)) + this.offset,
			offsetY = Math.floor(Math.random() * (this.offset * this.frequency)) + this.offset;

		return [offsetX, offsetY];
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 *
	 * returns {Object} split - 
	 */
	Glitch.prototype.rgbChannel = function(collection, offsetX, offsetY, hex) {

		var channel = collection.el.cloneNode(true);

		channel.style.position = 'absolute';

		for(var k in collection.propreties)
			if(collection.propreties[k] !== false)
				channel.style[k] = hex;

		channel.style.width = collection.placement.width + 'px';
		channel.style.height = collection.placement.height + 'px';
		channel.style.left = -offsetX + 'px';
		channel.style.top = offsetY + 'px';

		return channel;
	}

	/**
	 * 
	 *
	 * @param {String} rgb - 
	 *
	 * returns {String} hex -
	 */
	Glitch.prototype.rgbToHex = function(rgb) {

		rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

 		return '#' + this.hex(rgb[1]) + this.hex(rgb[2]) + this.hex(rgb[3]);
	}

	/**
	 * 
	 *
	 * @param {String} v - 
	 *
	 * returns {String} hex -
	 */
	Glitch.prototype.hex = function(v) {

		var hexDigits = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

		return isNaN(v) ? '00' : hexDigits[(v - v % 16) / 16] + hexDigits[v % 16];
	}

	/**
	 * 
	 *
	 * @param {String} v - 
	 *
	 * returns {Boolean}
	 */
	Glitch.prototype.isHex = function(v) {

		return v.match(/^[0-9A-Fa-f]+$/);
	}

	/**
	 * 
	 *
	 * @param {Number} n - 
	 *
	 * returns {Boolean}
	 */
	Glitch.prototype.isOdd = function(n) {

		return this.isNumber(n) && (Math.abs(n) % 2 == 1);
	}

	/**
	 * 
	 *
	 * @param {Number} n - 
	 *
	 * returns {Boolean}
	 */
	Glitch.prototype.isNumber = function(n) {

		return n === parseFloat(n);
	}

	/**
	 * 
	 *
	 * @param {Object} el - DOM Element
	 * @param {Object} propreties - 
	 *
	 */
	Glitch.prototype.css = function(el, propreties) {


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

	/**
	 * 
	 *
	 */
	Glitch.destroy = function() {

	}

	/**
	 * 
	 *
	 */
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