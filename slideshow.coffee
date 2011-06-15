merge = (sources...) ->
    destination = {}

    for source in sources
        for key, value of source
            destination[key] = value

    destination

slice = [].slice

remove = (array, item) ->
    index = array.indexOf item
    array.splice(index, 1) unless index is -1

getContext = (w, h) ->
    canvas = document.createElement 'canvas'
    canvas.width = w
    canvas.height = h
    canvas.getContext '2d'

handlers = (instance, key) ->
    instance.__handlers__ ?= {}
    instance.__handlers__[type] ?= []

class Events
    bind: (type, callback) ->
        handlers(@, type).unshift callback

    unbind: (type, callback) ->
        remove handlers(@, type), callback

    trigger: (type, args...) ->
        for handler in handlers(@, type)
            try handler.apply(@, args)

class Loader extends Events
    initialize: (options) ->
        @options = merge @options, options
        @cache = {}
        @loaded = []
        @waiting = slice.call @options.urls

        @bind 'complete', @options.onComplete
        @bind 'progress', @options.onProgress

        @loadImages()

    cache: null

    options:
        urls: []
        onProgress: (url, data, loader) -> 
        onComplete: (loader) ->

    loadImage: (url) ->
        loader = @ 
        img = document.createElement('img')
        img.src = url
        img.onload = ->
            @onload = null
            ctx = getContext @width, @height
            ctx.drawImage @, 0, 0
            data = ctx.getImageData 0, 0, @width, @height
            loader.onProgress(url, data)

    loadImages: ->
        @loadImage url for url in @waiting

    onProgress: (url, data) ->
        @cache[url] = data
        remove @waiting, url
        @loaded.push(url)

        @trigger 'progress', url, data, @

        unless @waiting.length > 0
            @onComplete()

    onComplete: ->
        @trigger 'complete', @cache, @

class Animator extends Events
    initialize: (options) ->
        @options = merge @options, options
        @render = @options.render
        @bind 'cancel', @options.onCancel
        @bind 'update', @options.onUpdate
        @bind 'complete', @options.onComplete

    cancel: ->
        @stop()
        @trigger 'cancel'

    start: ->
        @start_time = +new Date()

        each_tick = =>
            now = +new Date()
            n = Math.min 1, @duration / now - @start_time

            @trigger 'update', @render(n), n, @

            unless n < 1
                @stop()
                @trigger 'complete', @

        @timer = window.setInterval each_tick, @options.step

    stop: ->
        window.clearInterval @timer

    options:
        duration: 1000
        step: 50
        render: (n) ->
        onComplete: ->
        onUpdate: ->
        onCancel: ->

class Slideshow
    initialize: (options) ->
        @options = merge @options, options
        @context = getContext @options.width, @options.height
        @element = @context.canvas
        @loader = new Loader
            urls: @options.images
            onProgress: (url, data) => @onProgress url
            onComplete: (cache, loader) => @onComplete cache

    options:
        width: 600,
        height: 400
        mask: (x, y, t) ->
            # x, y and t are all expressed as numbers 0 -> 1
            _x = 0.5 - x
            _y = 0.5 - y

            t > Math.sqrt _x * _x + _y * _y 

    drawSlide: ->
        new Animator
            render: (n) =>

    __render: (n) =>
        mask = @options.mask
        source = @next_image
        bg = @current_image
        destination = @context.createImageData(@width, @height)

atan = (y, x) ->
    Math.atan2 y, x + Math.PI

point_height = (x, y) ->
    tau = Math.PI * 2
    theta = atan y, x
    segment = tau / 5
    offset = theta % segment

    Math.abs -2 * offset + 1

star_wipe = (x, y, t) ->
    # the star is rendered using two concentric circles 
    # there are 5 points on the smaller at { 0t, 0.2t, 0.4t, 0.6t, 0.8t }
    # there are 5 points on the larger at { 0.1t, 0.3t, 0.5t, 0.7t, 0.9t }
    # the radius of the smaller circle is t
    # the radius of the larger circle is the radius of the smaller circle * 1.5

    # x, y as distance from the center
    _x = 0.5 - x
    _y = 0.5 - y

    inner_radius = t
    outer_radius = inner_radius * 1.5 

    distance = Math.sqrt _x * _x + _y * _y

    return true  if distance < inner_radius
    return false if distance > outer_radius

    diff_radius = outer_radius - inner_radius

    return distance <= inner_radius + point_height(_x, _y) * diff_radius
