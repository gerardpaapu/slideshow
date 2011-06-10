(function() {
  var Animator, Loader, Slideshow, atan, getContext, merge, point_height, remove, slice, star_wipe;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  merge = function() {
    var destination, key, source, sources, value, _i, _len;
    sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    destination = {};
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      for (key in source) {
        value = source[key];
        destination[key] = value;
      }
    }
    return destination;
  };
  slice = [].slice;
  remove = function(array, item) {
    var index;
    index = array.indexOf(item);
    if (index !== -1) {
      return array.splice(index, 1);
    }
  };
  getContext = function(w, h) {
    var canvas;
    canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas.getContext('2d');
  };
  Loader = (function() {
    function Loader() {}
    Loader.prototype.initialize = function(options) {
      this.options = merge(this.options, options);
      this.cache = {};
      this.loaded = [];
      this.waiting = slice.call(this.options.urls);
      return this.loadImages();
    };
    Loader.prototype.cache = null;
    Loader.prototype.options = {
      urls: [],
      onProgress: function(url, data, loader) {},
      onComplete: function(loader) {}
    };
    Loader.prototype.loadImage = function(url) {
      var img, loader;
      loader = this;
      img = document.createElement('img');
      img.src = url;
      return img.onload = function() {
        var ctx, data;
        this.onload = null;
        ctx = getContext(this.width, this.height);
        ctx.drawImage(this, 0, 0);
        data = ctx.getImageData(0, 0, this.width, this.height);
        return loader.onProgress(url, data);
      };
    };
    Loader.prototype.loadImages = function() {
      var url, _i, _len, _ref, _results;
      _ref = this.waiting;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        url = _ref[_i];
        _results.push(this.loadImage(url));
      }
      return _results;
    };
    Loader.prototype.onProgress = function(url, data) {
      this.cache[url] = data;
      remove(this.waiting, url);
      this.loaded.push(url);
      this.options.onProgress.call(this, url, data, this);
      if (!(this.waiting.length > 0)) {
        return this.onComplete();
      }
    };
    Loader.prototype.onComplete = function() {
      return this.options.onComplete.call(this, this.cache, this);
    };
    return Loader;
  })();
  Animator = (function() {
    function Animator() {}
    Animator.prototype.initialize = function(options) {
      return this.options = merge(this.options, options);
    };
    Animator.prototype.cancel = function() {
      this.stop();
      return this.options.onCancel.call(this);
    };
    Animator.prototype.start = function() {
      var each_tick;
      this.start_time = +new Date();
      each_tick = __bind(function() {
        var n, now;
        now = +new Date();
        n = Math.min(1, this.duration / now - this.start_time);
        this.options.render.call(this, n);
        this.options.onUpdate.call(this, n);
        if (!(n < 1)) {
          this.stop();
          return this.options.onComplete.call(this);
        }
      }, this);
      return this.timer = window.setInterval(each_tick, this.options.step);
    };
    Animator.prototype.options = {
      duration: 1000,
      step: 50,
      render: function(n) {},
      onComplete: function() {},
      onUpdate: function() {},
      onCancel: function() {}
    };
    return Animator;
  })();
  Slideshow = (function() {
    function Slideshow() {
      this.__render = __bind(this.__render, this);
    }
    Slideshow.prototype.initialize = function(options) {
      this.options = merge(this.options, options);
      this.context = getContext(this.options.width, this.options.height);
      this.element = this.context.canvas;
      return this.loader = new Loader({
        urls: this.options.images,
        onProgress: __bind(function(url, data) {
          return this.onProgress(url);
        }, this),
        onComplete: __bind(function(cache, loader) {
          return this.onComplete(cache);
        }, this)
      });
    };
    Slideshow.prototype.options = {
      width: 600,
      height: 400,
      mask: function(x, y, t) {
        var _x, _y;
        _x = 0.5 - x;
        _y = 0.5 - y;
        return t > Math.sqrt(_x * _x + _y * _y);
      }
    };
    Slideshow.prototype.drawSlide = function() {
      return new Animator({
        render: __bind(function(n) {}, this)
      });
    };
    Slideshow.prototype.__render = function(n) {
      var bg, destination, mask, source;
      mask = this.options.mask;
      source = this.next_image;
      bg = this.current_image;
      return destination = this.context.createImageData(this.width, this.height);
    };
    return Slideshow;
  })();
  atan = function(y, x) {
    return Math.atan2(y, x) + Math.PI;
  };
  point_height = function(x, y) {
    var offset, segment, tau, theta;
    tau = Math.PI * 2;
    theta = atan(y, x);
    segment = tau / 5;
    offset = theta % segment;
    return Math.abs(-2 * offset + 1);
  };
  star_wipe = function(x, y, t) {
    var diff_radius, distance, inner_radius, outer_radius, _x, _y;
    _x = 0.5 - x;
    _y = 0.5 - y;
    inner_radius = t;
    outer_radius = inner_radius * 1.5;
    distance = Math.sqrt(_x * _x + _y * _y);
    if (distance < inner_radius) {
      return true;
    }
    if (distance > outer_radius) {
      return false;
    }
    diff_radius = outer_radius - inner_radius;
    return distance <= inner_radius + point_height(_x, _y) * diff_radius;
  };
}).call(this);
