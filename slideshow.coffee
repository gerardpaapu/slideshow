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
    instance.__handlers__[key] ?= []

class Events
    bind: (type, callback) ->
        handlers(@, type).unshift callback

    unbind: (type, callback) ->
        remove handlers(@, type), callback

    trigger: (type, args...) ->
        for handler in handlers(@, type)
            try handler.apply(@, args)

class Loader extends Events
    constructor: (options) ->
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

    loadImages: (images...) ->
        @waiting.push images...
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
    constructor: (options) ->
        @options = merge @options, options
        if @options.render then @render = @options.render
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
            t = (now - @start_time) / @options.duration 
            n = Math.max 0, Math.min(1, t)

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
        render: null
        onComplete: ->
        onUpdate: ->
        onCancel: ->

class TransitionAnimator extends Animator
    constructor: (options) ->
        super options
        @context = @options.context

    start: (left, right) ->
        @left = left
        @right = right
        super()

    render: (t) -> 
        {width, height} = @context.canvas

        throw new Error() unless @left? and @right? 

        same_width = width is @left.width is @right.width
        same_height = height is @left.height is @right.height

        unless same_width and same_height
            throw new Error()
        
        destination = @context.createImageData width, height
        data = destination.data 
        length = data.length / 4
        inv_width = 1 / width
        inv_height = 1 / height
        filter = @options.transition

        for i in [0..length]
            y = Math.floor(i * inv_width) * inv_height
            x = (i % width) * inv_width
            source = if t is 1 or filter(x, y, t) then @right else @left
            j = i * 4
            data[j + 0] = source.data[j + 0]
            data[j + 1] = source.data[j + 1]
            data[j + 2] = source.data[j + 2]
            data[j + 3] = 255

        @context.putImageData destination, 0, 0

    stop: ->
        @left = @right = null
        super()
    
class Slideshow
    constructor: (options) ->
        @options = merge @options, options
        @context = getContext @options.width, @options.height
        @element = @context.canvas
        @loader = new Loader
            urls: @options.images
            onProgress: (url, data) => @onProgress(url, data)

        @animator = new TransitionAnimator
            context: @context
            transition: Slideshow.transitions[@options.transition]

        @options.container.appendChild @element

    onProgress: (url, data) -> 
        if @loader.loaded.length is 1
            @context.putImageData data, 0, 0
            @current = url
            @start()
                 
    start: ->
        @timer = window.setInterval (=> @showNextSlide()), @options.interval

    stop: ->
        window.clearInterval @timer
        @timer = null

    timer: null
    
    showNextSlide: -> @showSlide @getNextSlide()

    showSlide: (url) ->
        prev = @current  
        cache = @loader.cache
        @current = url

        @animator.start cache[prev], cache[@current]

    getNextSlide: ->
        images = @loader.loaded
        index = images.indexOf @current
        throw new Error if index is -1  
        index = (index + 1) % images.length
        images[index]

    options:
        width: 600
        height: 400
        interval: 4000
        images: []
        transition: 'random_vert'

    @transitions:
        random_vert: (x, y, t) -> t >= (Math.random() + y) / 2

@Slideshow = Slideshow
