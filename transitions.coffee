{floor, sqrt, atan2, random, PI} = Math

tau = PI * 2

inv_tau = 1 / tau

sqrt_2 = sqrt 2

atan = (y, x) -> inv_tau * atan2(y, x) + Math.PI

hyp  = (x, y) -> sqrt x * x + y * y

shuffle = (arr) ->
    splice_random = (arr) ->
        index = floor(random() * arr.length)
        item = arr[index]
        arr.splice(index, 1)
        item

    _arr = arr.slice()

    splice_random _arr for i in arr

squares = shuffle [0..99]

transitions =
    star: (x, y, t) ->
        x = 0.5 - x
        y = 0.5 - y
        inner_radius = t
        outer_radius = inner_radius * 1.7
        distance = hyp x, y

        return true if distance < inner_radius
        return false if distance > outer_radius

        scale = outer_radius - inner_radius
        offset = atan(y, x) % 0.2
        root = 2 * (offset - 0.5)
        point_height = Math.abs(root)
        distance <= inner_radius + scale * point_height

    random_wipe: (x, y, t) -> t >= (random() + y) / 2

    vert_blinds: (x, y, t) -> t >= 5 * y % 1

    horz_blinds: (x, y, t) -> t >= 5 * x % 1

    what_blinds: (x, y, t) -> t >= 5 * (sqrt(x * y) % 0.2)

    circle_blinds: (x, y, t) ->
        t >= 5 * hyp(0.5 - x, 0.5 - y) % 1

    squares: (x, y, t) ->
        y = floor(y * 10)
        x = floor(x * 10)
        i = y * 10 + x
        t >= squares[i] / 100

Slideshow.transitions[key] = value for key, value of transitions
