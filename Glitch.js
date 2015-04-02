;(function () {
	'use strict';

	/**
	 * Description 
	 *
	 * @copyright Rebel Minds [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/**
	 * Instantiate Glitch.js on the specified layer.
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
		 * 
		 *
		 */
		this.attachStyles();

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
		this.start(this.delay);

		/**
		 * 
		 *
		 */
	}

	/**
	 * 
	 *
	 */
	Glitch.prototype.startListeners = function() {

		var self = this;

		//window.addEventListener('resize', function(e) { self.updateCollectionPlacement(); });
		window.addEventListener('resize', this.updateCollectionPlacement);
	}

	/**
	 * 
	 *
	 */
	Glitch.prototype.stopListeners = function() {

		window.removeEventListener('resize', this.updateCollectionPlacement);
	}

	Glitch.prototype.updateCollectionPlacement = function(e) {

		for (var i = 0; i < this.collection.length; i++) {
		 	
		 	var collection = this.collection[i];

		 	collection.placement = {

		 		width: collection.el.offsetWidth,
		 		height: collection.el.offsetHeight,
		 		top: collection.el.offsetTop,
		 		left: collection.el.offseLeft
		 	}

		 	if(collection.glitch)
		 		this.applyCss(collection.glitch.el, {
		 			top: collection.placement.top + 'px',
		 			left: collection.placement.left + 'px'
		 		});
		 }
	}

	/**
	 * 
	 *
	 */
	Glitch.prototype.attachStyles = function() {

		var sheet = this.styleSheet();

		this.addRule(sheet, '.rm-glitch', 'transition: all .3s ease', 0);
		this.addRule(sheet, '.rm-glitch-displace', 'transition: all .3s ease', 1);
		this.addRule(sheet, '.rm-glitch-rgbsplit', 'transition: all .3s ease', 2);

		console.log(sheet);
	}

	/**
	 * 
	 *
	 */
	Glitch.prototype.styleSheet = function() {

		var style = document.createElement("style");

		style.setAttribute("media", "screen");

		// WebKit hack :(
		style.appendChild(document.createTextNode(''));

		// Add the <style> element to the page
		document.head.appendChild(style);

		return style.sheet;
	}

	/**
	 * 
	 *
	 */
	Glitch.prototype.addRule = function(sheet, selector, rules, index) {
		
		if('insertRule' in sheet)
			sheet.insertRule(selector + '{' + rules + '}', index);
		else if('addRule' in sheet)
			sheet.addRule(selector, rules, index);
		else
			console.log('oh oh');
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

		this.applyCss(layer, {
			overflow: 'visible'
		});

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
	 * 
	 *
	 */
	Glitch.prototype.start = function(delay) {

		this.delay = delay || 0;

		this.stop();
    	var self = this;
    	this.timeoutID = window.setTimeout(function(e){ self.glitch(e); }, this.delay, 'glitch!');
	}

	/**
	 * 
	 *
	 */
	Glitch.prototype.stop = function() {

		if(typeof this.timeoutID === 'number') {
			window.clearTimeout(this.timeoutID);
			delete this.timeoutID;
		}
	}

	/**
	 * Glitch each element in collection
	 *
	 */
	Glitch.prototype.glitch = function(e) {

		console.log(e);
    	
    	delete this.timeoutID;

    	this.expectedCallbacks = 0;
    	this.callbackCounter = 0;

		for (var i = 0; i < this.collection.length; i++)
		 	this.add(this.collection[i]);
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 *
	 * returns {Object} glitch - 
	 */
	Glitch.prototype.add = function(collection) {

		if(collection.glitch) this.remove(collection);

		if(!this.isElementOnViewport(collection.el)) return;

		++this.expectedCallbacks;

		var parentNode = collection.el.parentNode,
			parentComputedStyle = window.getComputedStyle(parentNode),
			parentTop = parentComputedStyle.getPropertyValue('top'),
			parentLeft = parentComputedStyle.getPropertyValue('left');

		var el = document.createElement('DIV'),

			rgbSplit = this.rgbSplit(collection),
			displace = this.displace(collection);

		this.applyCss(el, {
			position: 'absolute',
			overflow: 'visible',
			width: collection.placement.width + 'px',
			height: collection.placement.height + 'px',
			top: (isNaN(parentTop) ? collection.placement.top : collection.placement.top + parentTop) + 'px',
			left: (isNaN(parentLeft) ? collection.placement.left : collection.placement.left + parentLeft) + 'px'
		}).className = 'rm-glitch';

		el.appendChild(rgbSplit);
		el.appendChild(displace);

		collection.el.style.opacity = 0;

		collection['glitch'] = {

			el: el, 
			rgbSplit: rgbSplit, 
			displace: displace 
		};

		this.applyCss(parentNode, {
	 		overflow: 'visible'
	 	}).appendChild(el);

	 	var self = this,
	 		duration = Math.floor(Math.random() * 900) + 600,
	 		timeoutID = window.setTimeout(function() { self.remove(collection); clearTimeout(timeoutID); }, duration);

		return collection;
	}

	/**
	 * 
	 *
	 * @param {Object} collection - 
	 */
	Glitch.prototype.remove = function(collection) {

		++this.callbackCounter;
		
		collection.el.style.opacity = 1;

		collection.glitch.el.parentNode.removeChild(collection.glitch.el);

		delete collection.glitch;

		if(this.callbackCounter === this.expectedCallbacks) this.start(Math.floor(Math.random() * 5400) + 1800);
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

		this.applyCss(displace, {
			position: 'absolute',
			overflow: 'visible',
			width: collection.placement.width + 'px',
			height: collection.placement.height + 'px',
			top: 0,
			left: 0
		}).className = 'rm-glitch-displace';

		var slices = Math.ceil(collection.placement.height / 15); //TO DO: BETTER SPLIT FORMULA

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

		this.applyCss(slice, {
			position: 'absolute',
			overflow: 'hidden',
			width: collection.placement.width + 'px',
			height: offsetY + 'px',
			left: (isOdd ? -offsetX : offsetX) + 'px',
			top: (position[0] * offsetY) + 'px'
		});

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
			offset = this.channelOffset(),
			red = this.rgbChannel(collection, -offset[0], offset[1], '#FF00FF'),
			//green = this.rgbChannel(collection, offset[0], offset[1], '#FFFF00'),
			blue = this.rgbChannel(collection, offset[0], -offset[1], '#00FFFF');

		this.applyCss(rgbSplit, {
			overflow: 'visible',
			width: collection.placement.width + 'px',
			height: collection.placement.height + 'px'
		}).className = 'rm-glitch-rgbsplit';

		rgbSplit.appendChild(red);
		//rgbSplit.appendChild(green);
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

		this.applyCss(channel, {
			width: collection.placement.width + 'px',
			height: collection.placement.height + 'px',
			left: -offsetX + 'px',
			top: offsetY + 'px'
		});

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

	Glitch.prototype.isElementOnViewport = function(el) {

		var rect = el.getBoundingClientRect();

	    return (
	        rect.top >= 0 &&
	        rect.left >= 0 &&
	        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
	        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	    );
	}

	/**
	 * 
	 *
	 * @param {Object} el - DOM Element
	 * @param {Object} properties - 
	 *
	 */
	Glitch.prototype.applyCss = function(el, properties) {

		for(var k in properties)
			el.style[k] = properties[k];

		return el;
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
	Glitch.update = function(layer, options) {


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