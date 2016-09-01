(function($, window, document, undefined) {

    var core, item_width, item_count, half, dim, distZ, $owlItems, opacity;

    var Circular = function(carousel) {

        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        core = carousel;
        console.log(carousel);

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
        core.$element.on(this._handlers);
    }

    //methods:

    Circular.prototype.init = function(e) {

        item_width = core.width() / core.options.items;
        item_count = core.options.items;
        half = parseInt(item_count / 2);
        dim = item_width * 2;
        distZ = -200;
        $owlItems = core.$element.find(".owl-item"),
        opacity = 0.2;

        scroll(0);

        /*override owl onDragMove method*/
        var originalOnDragMove = core.onDragMove;

        core.onDragMove = function() {

            if (!this.state.isTouch) {
                return;
            }

            if (this.state.isScrolling) {
                return;
            }

            originalOnDragMove.apply(this, arguments);
            if (this.drag.distance !== 0) {
                scroll(this.drag.distance, true);
            }

        }

        /*override owl onDragMove method*/
        var originalOnDragEnd = core.onDragEnd;

        core.onDragEnd = function() {

            if (!this.state.isTouch) {
                return;
            }

            /*set animation speed*/
            core.speed(core.settings.dragEndSpeed || core.settings.smartSpeed);

            /*auto scroll to position*/
            originalOnDragEnd.apply(this, arguments);
            scroll(0);
        }

        var originalAnimate = core.animate;

        core.animate = function() {
            console.log("hello");
            /*auto scroll to position*/
            originalAnimate.apply(this, arguments);
        }

        /*Go to clicked item*/
        $owlItems.each(function(index, item) {
            $(item).click(function(e) {
                core.to(core.relative(index));
                jumpTo(index);
            })
        });
    }

    /**
     * animate to target element
     * @param  {number} x [absolute position of target element]
     */
    var jumpTo = function(x) {
        var distance = x - core.current(),
            revert = core.current(),
            before = core.current(),
            after = core.current() + distance,
            direction = before - after < 0 ? true : false,
            items = core._clones.length + core._items.length;

        if (after < core.settings.items && direction === false) {
            revert = before + core._items.length;
            core.reset(revert);
        } else if (after >= items - core.settings.items && direction === true) {
            revert = before - core._items.length;
            core.reset(revert);
        }
        console.log("revert", revert);

        var center = revert + distance,
            tween = 0,
            dir = (core.state.direction === 'left' ? -1 : +1);

        /*center element*/
        $($owlItems[center]).css({
            transform: "translateZ(" + (distZ * tween) + "px)",
            transition: (core.speed() / 1000) + 's',
            opacity: (1 - (opacity * tween))
        });

        /*loop through side elements*/

        /*Right elements*/
        for (var i = center + 1; i < $owlItems.length; i++) {
            $($owlItems[i]).css({
                transform: "translateZ(" + (distZ * ((i - center) - (-dir * tween))) + "px)",
                transition: 'transform' + (core.speed() / 1000) + 's',
                opacity: (1 - (opacity * ((i - center) - (-dir * tween))))
            });
        }

        /*Left elements*/
        for (var i = center - 1; i >= 0; i--) {
            $($owlItems[i]).css({
                transform: "translateZ(" + (distZ * ((center - i) + (-dir * tween))) + "px)",
                transition: 'transform' + (core.speed() / 1000) + 's',
                opacity: (1 - (opacity * ((center - i) + (-dir * tween))))
            });
        }
    }

    /**
     * animating z translation on dragging carousel
     * @param {Number} coordinate - distance dragged in pixels.
     */
    var scroll = function(x, dragMove) {
        var delta = x,
            dir = (core.state.direction === 'left' ? -1 : +1),
            tween = dir * (delta * 2) / dim,
            moveX = -dir * Math.abs(parseInt(delta / item_width)),
            center_item = core.$element.find(".owl-item.center").index() + moveX,
            center = core.normalize(center_item);

        if (dragMove && core.settings.loop) {
            if ((center_item <= core.minimum()) && (core.state.direction === 'right')) {
                center = core.maximum() - (core.minimum() - center_item);
            } else if ((center_item >= core.maximum()) && (core.state.direction === 'left')) {
                center = core.minimum() + (center_item - core.maximum());
            }
        }
        // console.log("scroll ", center);
        tween = tween - parseInt(tween);
        console.log("tween", tween);
        // console.log(core.drag.currentX);

        /*center element*/
        $($owlItems[center]).css({
            transform: "translateZ(" + (distZ * tween) + "px)",
            transition: 'transform' + (core.speed() / 1000) + 's',
            opacity: (1 - (opacity * tween))
        });

        /*loop through side elements*/

        /*Right elements*/
        for (var i = center + 1; i < $owlItems.length; i++) {
            $($owlItems[i]).css({
                transform: "translateZ(" + (distZ * ((i - center) - (-dir * tween))) + "px)",
                transition: 'transform' + (core.speed() / 1000) + 's',
                opacity: (1 - (opacity * ((i - center) - (-dir * tween))))
            });
        }

        /*Left elements*/
        for (var i = center - 1; i >= 0; i--) {
            $($owlItems[i]).css({
                transform: "translateZ(" + (distZ * ((center - i) + (-dir * tween))) + "px)",
                transition: 'transform' + (core.speed() / 1000) + 's',
                opacity: (1 - (opacity * ((center - i) + (-dir * tween))))
            });
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Circular = Circular;

}(window.Zepto || window.jQuery, window, document))
