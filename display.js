var Display;
(function (){
    var defaults, merge, type, keys, hasOwn, undef;
   
    Display = function (options) {
        this.options = options = merge(defaults, options || {});

        this.canvas = document.createElement('canvas'); 
        this.width = this.canvas.width = options.width;
        this.height = this.canvas.height = options.height;
        this.canvas.id = options.id;

        this.context = this.canvas.getContext('2d');
        this.loadImages();
    };

    defaults = {
        width: 320,
        height: 440,
        id: "Display",
        images: {},
        onProgress: function () {},
        onLoad: function () {}
    };

    Display.prototype.clear = function (x, y, width, height) {
        x = x || 0;
        y = y || 0;
        width = width || this.canvas.width;
        height = height || this.canvas.height;

        this.context.clearRect(x, y, width, height);
    };

    Display.prototype.image_data = {};

    Display.prototype.draw = function (key, x, y) {
        var data = this.image_data[key];

        if (data) {
            this.context.putImageData(data, x, y);
        }
    };

    Display.prototype.drawWithMask = function (key, mask, t) {
        var source = this.image_data[key],
            dest   = this.context.getImageData(0, 0, this.width, this.height),
            len    = dest.data.length,
            _width = this.width * 4,
            i, y, x, report;

        for (i = 0; i < len; i++) {
            // read the alpha channel of the mask
            y = Math.floor(i / _width) / this.height; 
            x = (i % _width) / _width;

            if (mask(x, y, t)) {
                dest.data[i] = source.data[i++]; // copy red
                dest.data[i] = source.data[i++]; // copy green
                dest.data[i] = source.data[i++]; // copy blue
                //                                  skip alpha
            } else {
                i += 3;
            }
        }

        this.context.putImageData(dest, 0, 0);
    };

    Display.prototype.loadImages = function () {
        var key, value, display, images, loadImage, waiting, onProgress, onComplete;

        images = this.options.images;
        waiting = keys(images).length;
        display = this;

        loadImage = function (key, url, x, y) { 
            var image;
            image = document.createElement('img'); 
            image.src = url;
            image.onload = function () {
                var ctx = display.context;
                ctx.clearRect(0, 0, display.width, display.height);
                ctx.drawImage(this, 0, 0);        
                onProgress(key, ctx.getImageData(0, 0, display.width, display.height));
            };
        };

        onProgress = function (key, data) {
            waiting--;    

            display.image_data[key] = data; 
            display.options.onProgress(key, data);
            
            if (waiting === 0) {
                display.options.onLoad.call(display, display);
            }
        };

        for (key in images) {
            value = images[key];

            switch (type( value )) {
                case "string":
                    loadImage(key, value);
                    break;
                case "array":  
                    loadImage.apply(undef, [key].concat(value));
                    break;
            }
        } 
    };

    hasOwn = {}.hasOwnProperty;

    merge = function () {
        var i = 0,
            len = arguments.length,
            result = {},
            key, source;

        for (; i < len; i++) {
           source = arguments[i];
           for (key in source) {
               if (hasOwn.call(source, key)) {
                   result[key] = source[key];
               }
           }
        }

        return result;
    };

    keys = Object.keys || function (o) {
        var key, result = [];
        for (key in o) {
            if (hasOwn.call(o, key)) {
                result.push(key);
            }
        }
    };

    type = function (o) {
        return o == undef ? String(o)
            :  {}.toString.call(o).slice(8, -1).toLowerCase();
    };

    return Display;
}.call(null));
