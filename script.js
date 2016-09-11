(function($, window, document, undefined) {

    var item_width, item_count, half, dim, distZ, $owlItems, opacity;

    var PerspectiveCarousel = function(carousel) {

        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;
        console.log(carousel);

        // set the default options
        this._core.options = $.extend({}, PerspectiveCarousel.Defaults, this._core.options);

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel': $.proxy(function(e) {
                this.init(e);
            }, this)
        }

        // register event handlers
        this._core.$element.on(this._handlers);
    }

    /**
     * Default options.
     * @public
     */
    PerspectiveCarousel.Defaults = {
            zoomScale: -200,
            opacityScale: 0.2
        }
        //methods:

    PerspectiveCarousel.prototype.init = function(e) {

        item_width = this._core.width() / this._core.options.items;
        item_count = this._core.options.items;
        half = parseInt(item_count / 2);
        dim = item_width * 2;
        distZ = this._core.options.zoomScale;
        $owlItems = this._core.$stage.children(),
        opacity = this._core.options.opacityScale;

        this.perspectiveScroll(this._core.getTransformProperty());

        /*override owl animate method*/
        var originalAnimate = this._core.animate;

        this._core.animate = function() {
            originalAnimate.apply(this, arguments);
            //method for perspective 3d animation
            this._plugins.perspectiveCarousel.perspectiveScroll(arguments[0]);
        }

        var perspectiveCarousel = this;

        /*Go to clicked item*/
        $owlItems.each(function(index, item) {
            $(item).click(function(e) {
                var owlCore = perspectiveCarousel._core,
                    endItems = false;

                if (owlCore.state.inMotion || Math.abs(owlCore.drag.distance) > 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                //hack to make continuous animation for end elements
                if (owlCore.settings.loop) {
                    if (index < owlCore.minimum()) {
                        var revert = owlCore.current() + owlCore._items.length,
                            distance = index - owlCore.current();
                        owlCore.reset(revert);
                        window.clearTimeout(owlCore.e._goToLoop);
                        owlCore.e._goToLoop = window.setTimeout(function() {
                            owlCore.speed(owlCore.duration(owlCore.current(), revert + distance, 300));
                            owlCore.current(revert + distance);
                            console.log(revert + distance);
                            owlCore.update();
                        }, 30);
                        endItems = true;
                    } else if (index >= owlCore.maximum()) {
                        var revert = owlCore.current() - owlCore._items.length,
                            distance = index - owlCore.current();
                        owlCore.reset(revert);
                        window.clearTimeout(owlCore.e._goToLoop);
                        owlCore.e._goToLoop = window.setTimeout(function() {
                            owlCore.speed(owlCore.duration(owlCore.current(), revert + distance, 300));
                            owlCore.current(revert + distance);
                            console.log(revert + distance);
                            owlCore.update();
                        }, 30);
                        endItems = true;
                    }
                }

                if (!endItems) {
                    owlCore.speed(300);
                    owlCore.to(owlCore.relative(index), 300);
                }
            })
        });
    }

    /**
     * animating z translation on dragging carousel
     * @param {Number} coordinate - coordinate of owl stage in pixels.
     */
    PerspectiveCarousel.prototype.perspectiveScroll = function(coordinate) {
        var dir = (this._core.state.direction === 'left' ? -1 : +1),
            half = Math.floor(this._core.settings.items / 2),
            coordinate = (this._core.settings.items % 2) == 0 ? parseFloat(coordinate) + (item_width / 2) : coordinate, //fix for even number of item
            current_pos = parseFloat(coordinate / this._core._coordinates[0]).toFixed(2),
            tween = 0,
            center = Math.ceil(current_pos) + half;

        // if (current_pos < 0) {
        //   return;
        // }

        console.log("coordinate",coordinate);

        if (this._core.state.direction === 'right') {
            center = Math.ceil(current_pos) + half;
            tween = Math.ceil(current_pos) - (current_pos);
        } else if (this._core.state.direction === 'left') {
            center = Math.floor(current_pos) + half;
            tween = (current_pos) - parseInt(current_pos);
        }

        console.log("tween", tween);


        /*center element*/
        $($owlItems[center]).css({
            transform: "translateZ(" + (distZ * tween) + "px)",
            transition: 'transform ' + (this._core.speed() / 1000) + 's',
            opacity: (1 - (opacity * tween))
        });

        /*loop through side elements*/

        /*Right elements*/
        for (var i = center + 1; i < $owlItems.length; i++) {
            $($owlItems[i]).css({
                transform: "translateZ(" + (distZ * ((i - center) - (-dir * tween))) + "px)",
                transition: 'transform ' + (this._core.speed() / 1000) + 's',
                opacity: (1 - (opacity * ((i - center) - (-dir * tween))))
            });
        }

        /*Left elements*/
        for (var i = center - 1; i >= 0; i--) {
            $($owlItems[i]).css({
                transform: "translateZ(" + (distZ * ((center - i) + (-dir * tween))) + "px)",
                transition: 'transform ' + (this._core.speed() / 1000) + 's',
                opacity: (1 - (opacity * ((center - i) + (-dir * tween))))
            });
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.PerspectiveCarousel = PerspectiveCarousel;

}(window.Zepto || window.jQuery, window, document))
