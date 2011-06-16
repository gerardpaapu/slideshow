(function() {
  var Animator, Events, Loader, Slideshow, TransitionAnimator, getContext, handlers, merge, remove, slice;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
  handlers = function(instance, key) {
    var _base, _ref, _ref2;
        if ((_ref = instance.__handlers__) != null) {
      _ref;
    } else {
      instance.__handlers__ = {};
    };
    return (_ref2 = (_base = instance.__handlers__)[key]) != null ? _ref2 : _base[key] = [];
  };
  Events = (function() {
    function Events() {}
    Events.prototype.bind = function(type, callback) {
      return handlers(this, type).unshift(callback);
    };
    Events.prototype.unbind = function(type, callback) {
      return remove(handlers(this, type), callback);
    };
    Events.prototype.trigger = function() {
      var args, handler, type, _i, _len, _ref, _results;
      type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = handlers(this, type);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push((function() {
          try {
            return handler.apply(this, args);
          } catch (_e) {}
        }).call(this));
      }
      return _results;
    };
    return Events;
  })();
  Loader = (function() {
    __extends(Loader, Events);
    function Loader(options) {
      this.options = merge(this.options, options);
      this.cache = {};
      this.loaded = [];
      this.waiting = slice.call(this.options.urls);
      this.bind('complete', this.options.onComplete);
      this.bind('progress', this.options.onProgress);
      this.loadImages();
    }
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
      var images, url, _i, _len, _ref, _ref2, _results;
      images = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref = this.waiting).push.apply(_ref, images);
      _ref2 = this.waiting;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        url = _ref2[_i];
        _results.push(this.loadImage(url));
      }
      return _results;
    };
    Loader.prototype.onProgress = function(url, data) {
      this.cache[url] = data;
      remove(this.waiting, url);
      this.loaded.push(url);
      this.trigger('progress', url, data, this);
      if (!(this.waiting.length > 0)) {
        return this.onComplete();
      }
    };
    Loader.prototype.onComplete = function() {
      return this.trigger('complete', this.cache, this);
    };
    return Loader;
  })();
  Animator = (function() {
    __extends(Animator, Events);
    function Animator(options) {
      this.options = merge(this.options, options);
      if (this.options.render) {
        this.render = this.options.render;
      }
      this.bind('cancel', this.options.onCancel);
      this.bind('update', this.options.onUpdate);
      this.bind('complete', this.options.onComplete);
    }
    Animator.prototype.cancel = function() {
      this.stop();
      return this.trigger('cancel');
    };
    Animator.prototype.start = function() {
      var each_tick;
      this.start_time = +new Date();
      each_tick = __bind(function() {
        var n, now, t;
        now = +new Date();
        t = (now - this.start_time) / this.options.duration;
        n = Math.max(0, Math.min(1, t));
        this.trigger('update', this.render(n), n, this);
        if (!(n < 1)) {
          this.stop();
          return this.trigger('complete', this);
        }
      }, this);
      return this.timer = window.setInterval(each_tick, this.options.step);
    };
    Animator.prototype.stop = function() {
      return window.clearInterval(this.timer);
    };
    Animator.prototype.options = {
      duration: 1000,
      step: 50,
      render: null,
      onComplete: function() {},
      onUpdate: function() {},
      onCancel: function() {}
    };
    return Animator;
  })();
  TransitionAnimator = (function() {
    __extends(TransitionAnimator, Animator);
    function TransitionAnimator(options) {
      TransitionAnimator.__super__.constructor.call(this, options);
      this.context = this.options.context;
    }
    TransitionAnimator.prototype.start = function(left, right) {
      this.left = left;
      this.right = right;
      return TransitionAnimator.__super__.start.call(this);
    };
    TransitionAnimator.prototype.render = function(t) {
      var data, destination, filter, height, i, inv_height, inv_width, j, length, same_height, same_width, source, width, x, y, _ref, _ref2, _ref3;
      _ref = this.context.canvas, width = _ref.width, height = _ref.height;
      if (!((this.left != null) && (this.right != null))) {
        throw new Error();
      }
      same_width = (width === (_ref2 = this.left.width) && _ref2 === this.right.width);
      same_height = (height === (_ref3 = this.left.height) && _ref3 === this.right.height);
      if (!(same_width && same_height)) {
        throw new Error();
      }
      destination = this.context.createImageData(width, height);
      data = destination.data;
      length = data.length / 4;
      inv_width = 1 / width;
      inv_height = 1 / height;
      filter = this.options.transition;
      for (i = 0; 0 <= length ? i <= length : i >= length; 0 <= length ? i++ : i--) {
        y = Math.floor(i * inv_width) * inv_height;
        x = (i % width) * inv_width;
        source = t === 1 || filter(x, y, t) ? this.right : this.left;
        j = i * 4;
        data[j + 0] = source.data[j + 0];
        data[j + 1] = source.data[j + 1];
        data[j + 2] = source.data[j + 2];
        data[j + 3] = 255;
      }
      return this.context.putImageData(destination, 0, 0);
    };
    TransitionAnimator.prototype.stop = function() {
      this.left = this.right = null;
      return TransitionAnimator.__super__.stop.call(this);
    };
    return TransitionAnimator;
  })();
  Slideshow = (function() {
    function Slideshow(options) {
      this.options = merge(this.options, options);
      this.context = getContext(this.options.width, this.options.height);
      this.element = this.context.canvas;
      this.loader = new Loader({
        urls: this.options.images,
        onProgress: __bind(function(url, data) {
          return this.onProgress(url, data);
        }, this)
      });
      this.animator = new TransitionAnimator({
        context: this.context,
        transition: Slideshow.transitions[this.options.transition]
      });
      this.options.container.appendChild(this.element);
    }
    Slideshow.prototype.onProgress = function(url, data) {
      if (this.loader.loaded.length === 1) {
        this.context.putImageData(data, 0, 0);
        this.current = url;
        return this.start();
      }
    };
    Slideshow.prototype.start = function() {
      return this.timer = window.setInterval((__bind(function() {
        return this.showNextSlide();
      }, this)), this.options.interval);
    };
    Slideshow.prototype.stop = function() {
      window.clearInterval(this.timer);
      return this.timer = null;
    };
    Slideshow.prototype.timer = null;
    Slideshow.prototype.showNextSlide = function() {
      return this.showSlide(this.getNextSlide());
    };
    Slideshow.prototype.showSlide = function(url) {
      var cache, prev;
      prev = this.current;
      cache = this.loader.cache;
      this.current = url;
      return this.animator.start(cache[prev], cache[this.current]);
    };
    Slideshow.prototype.getNextSlide = function() {
      var images, index;
      images = this.loader.loaded;
      index = images.indexOf(this.current);
      if (index === -1) {
        throw new Error;
      }
      index = (index + 1) % images.length;
      return images[index];
    };
    Slideshow.prototype.options = {
      width: 600,
      height: 400,
      interval: 4000,
      images: [],
      transition: 'random_vert'
    };
    Slideshow.transitions = {
      random_vert: function(x, y, t) {
        return t >= (Math.random() + y) / 2;
      }
    };
    return Slideshow;
  })();
  this.Slideshow = Slideshow;
}).call(this);
