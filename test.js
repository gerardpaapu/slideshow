(function () {
    var Slideshow = this.Slideshow;
    
    new Slideshow({
        images: [
            "/img/07.jpg", "/img/08.jpg", "/img/09.jpg", "/img/10.jpg", "/img/11.jpg",
            "/img/12.jpg", "/img/13.jpg", "/img/14.jpg", "/img/15.jpg", "/img/16.jpg",
            "/img/17.jpg", "/img/18.jpg", "/img/19.jpg", "/img/20.jpg", "/img/21.jpg",
            "/img/22.jpg", "/img/23.jpg", "/img/24.jpg", "/img/25.jpg", "/img/26.jpg",
            "/img/27.jpg", "/img/28.jpg", "/img/29.jpg", "/img/30.jpg", "/img/31.jpg",
            "/img/32.jpg", "/img/33.jpg", "/img/34.jpg", "/img/35.jpg" ], 
        width: 304,
        height: 405,
        container: document.getElementById('SlideshowWrapper'),
        transition: 'circle_blinds'
    });
}.call(this));
