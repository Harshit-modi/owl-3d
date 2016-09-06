(function($, window, document, undefined) {

    var item_width, item_count, half, dim, distZ, $owlItems, opacity;

    var Circular = function(carousel) {

        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;
        console.log(carousel);

        // set the default options
    		this._core.options = $.extend({}, Circular.Defaults, this._core.options);

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
    Circular.Defaults = {
      zoomScale: -200,
      opacityScale: 0.2
    }
    //methods:

    Circular.prototype.init = function(e) {

        item_width = this._core.width() / this._core.options.items;
        item_count = this._core.options.items;
        half = parseInt(item_count / 2);
        dim = item_width * 2;
        distZ = this._core.options.zoomScale;
        $owlItems = this._core.$element.find(".owl-item"),
        opacity = this._core.options.opacityScale;

        this.scroll(0);

        /*override owl onDragMove method*/
        var originalOnDragMove = this._core.onDragMove;

        this._core.onDragMove = function() {

            if (!this.state.isTouch) {
                return;
            }

            if (this.state.isScrolling) {
                return;
            }

            originalOnDragMove.apply(this, arguments);
            if (this.drag.distance !== 0) {
                this._plugins.circular.scroll(this.drag.distance, true);
            }

        }

        /*override owl onDragMove method*/
        var originalOnDragEnd = this._core.onDragEnd;

        this._core.onDragEnd = function() {

            if (!this.state.isTouch) {
                return;
            }

            /*set animation speed*/
            this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);

            /*auto scroll to position*/
            originalOnDragEnd.apply(this, arguments);
            this._plugins.circular.scroll(0);
        }

        var originalAnimate = this._core.animate;

        this._core.animate = function() {
            /*auto scroll to position*/
            originalAnimate.apply(this, arguments);
        }

        var circular = this;

        /*Go to clicked item*/
        $owlItems.each(function(index, item) {
            $(item).click(function(e) {
              circular._core.speed(500);
                circular._core.to(circular._core.relative(index), 500);
                circular.jumpTo(index);
            })
        });
    }

    /**
     * animate to target element
     * @param  {number} x [absolute position of target element]
     */
    Circular.prototype.jumpTo = function(x) {
        var distance = x - this._core.current(),
            revert = this._core.current(),
            before = this._core.current(),
            after = this._core.current() + distance,
            direction = before - after < 0 ? true : false,
            items = this._core._clones.length + this._core._items.length;

        if (after < this._core.settings.items && direction === false) {
            revert = before + this._core._items.length;
            this._core.reset(revert);
        } else if (after >= items - this._core.settings.items && direction === true) {
            revert = before - this._core._items.length;
            this._core.reset(revert);
        }
        console.log("revert", revert);

        var center = revert + distance,
            tween = 0,
            dir = (this._core.state.direction === 'left' ? -1 : +1);

        /*center element*/
        $($owlItems[center]).css({
            transform: "translateZ(" + (distZ * tween) + "px)",
            transition: (this._core.speed() / 1000) + 's',
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
    }

    /**
     * animating z translation on dragging carousel
     * @param {Number} coordinate - distance dragged in pixels.
     */
    Circular.prototype.scroll = function(x, dragMove) {
        var delta = x,
            dir = (this._core.state.direction === 'left' ? -1 : +1),
            tween = dir * (delta * 2) / dim,
            moveX = -dir * Math.abs(parseInt(delta / item_width)),
            center_item = this._core.$element.find(".owl-item.center").index() + moveX,
            center = this._core.normalize(center_item);

        if (dragMove && this._core.settings.loop) {
            if ((center_item <= this._core.minimum()) && (this._core.state.direction === 'right')) {
                center = this._core.maximum() - (this._core.minimum() - center_item);
            } else if ((center_item >= this._core.maximum()) && (this._core.state.direction === 'left')) {
                center = this._core.minimum() + (center_item - this._core.maximum());
            }
        }
        // console.log("scroll ", center);
        tween = tween - parseInt(tween);
        console.log("tween", tween);
        // console.log(this._core.drag.currentX);

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

    $.fn.owlCarousel.Constructor.Plugins.Circular = Circular;

}(window.Zepto || window.jQuery, window, document))
