/*globals Display: false */

var atan, hyp, point_height, star_wipe, twist_wipe, blinds, circle_blinds, random_wipe, sqrt_2;

sqrt_2 = Math.sqrt(2);

atan = function(y, x) {
    return Math.atan2(y, x) + Math.PI;
};

hyp = function(x, y) {
    return Math.sqrt(x * x + y * y);
};

point_height = function(x, y) {
    var tau = Math.PI * 2,
        theta = atan(y, x),
        segment = tau / 5,
        offset = theta % segment,
        root = 2 * (offset - 0.5);

    return root * root;
};
star_wipe = function(x, y, t) {
    var diff_radius, distance, inner_radius, outer_radius, _x, _y;
    _x = 0.5 - x;
    _y = 0.5 - y;
    inner_radius = t;
    outer_radius = inner_radius * 1.7;
    distance = hyp(_x, _y);
    if (distance < inner_radius) {
        return true;
    }
    if (distance > outer_radius) {
        return false;
    }
    diff_radius = outer_radius - inner_radius;
    return distance <= inner_radius + point_height(_x, _y) * diff_radius;
};

window.onload = function () {
    new Display({
        width: 400,
        height: 533,

        images: {
            luigi: "luigi.jpg",
            baby: "baby.jpg"
        },

        onLoad: function (display) {
            var start_animating, duration, step, iris_out, image;

            display.draw('baby', 0, 0);
            document.getElementById('Container').appendChild(this.canvas);

            duration = 1000;
            step = 1000 / 60 | 0;
         
            iris_out = function (x, y, t) {
                x = 0.5 - x;
                y = 0.5 - y;
                return t > Math.sqrt(x * x + y * y);
            };

            start_animating = function () {
                var timer, each_frame, start_time;
                image = image === 'luigi' ? 'baby' : 'luigi';
                start_time = +new Date();

                each_frame = function  () {
                    var now = +new Date(),
                    n = now - start_time,
                    t = Math.min(1, n / duration);

                    display.drawWithMask(image, star_wipe, t);

                    if (timer && t >= 1) {
                        window.clearInterval(timer);
                    } 
                };

                timer = window.setInterval(each_frame, step);
            };

            window.setInterval(start_animating, 2000);
        }
    });
};
