(function($, drupalSettings){
  Drupal.behaviors.leaflet_map = {
    attach: function(settings, context) {
      L.Control.Sidebar = L.Control.extend({

        includes: L.Mixin.Events,

        options: {
          closeButton: true,
          position: 'left',
          autoPan: true,
        },

        initialize: function (placeholder, options) {
          L.setOptions(this, options);

          // Find content container
          var content = this._contentContainer = L.DomUtil.get(placeholder);

          // Remove the content container from its original parent
          content.parentNode.removeChild(content);

          var l = 'leaflet-';

          // Create sidebar container
          var container = this._container =
            L.DomUtil.create('div', l + 'sidebar ' + this.options.position);

          // Style and attach content container
          L.DomUtil.addClass(content, l + 'control');
          container.appendChild(content);

          // Create close button and attach it if configured
          if (this.options.closeButton) {
            var close = this._closeButton =
              L.DomUtil.create('a', 'close', container);
            close.innerHTML = '&times;';
          }
        },

        addTo: function (map) {
          var container = this._container;
          var content = this._contentContainer;

          // Attach event to close button
          if (this.options.closeButton) {
            var close = this._closeButton;

            L.DomEvent.on(close, 'click', this.hide, this);
          }

          L.DomEvent
            .on(container, 'transitionend',
              this._handleTransitionEvent, this)
            .on(container, 'webkitTransitionEnd',
              this._handleTransitionEvent, this);

          // Attach sidebar container to controls container
          var controlContainer = map._controlContainer;
          controlContainer.insertBefore(container, controlContainer.firstChild);

          this._map = map;

          // Make sure we don't drag the map when we interact with the content
          var stop = L.DomEvent.stopPropagation;
          var fakeStop = L.DomEvent._fakeStop || stop;
          L.DomEvent
            .on(content, 'contextmenu', stop)
            .on(content, 'click', fakeStop)
            .on(content, 'mousedown', stop)
            .on(content, 'touchstart', stop)
            .on(content, 'dblclick', fakeStop)
            .on(content, 'mousewheel', stop)
            .on(content, 'MozMousePixelScroll', stop);

          return this;
        },

        removeFrom: function (map) {
          //if the control is visible, hide it before removing it.
          this.hide();

          var container = this._container;
          var content = this._contentContainer;

          // Remove sidebar container from controls container
          var controlContainer = map._controlContainer;
          controlContainer.removeChild(container);

          //disassociate the map object
          this._map = null;

          // Unregister events to prevent memory leak
          var stop = L.DomEvent.stopPropagation;
          var fakeStop = L.DomEvent._fakeStop || stop;
          L.DomEvent
            .off(content, 'contextmenu', stop)
            .off(content, 'click', fakeStop)
            .off(content, 'mousedown', stop)
            .off(content, 'touchstart', stop)
            .off(content, 'dblclick', fakeStop)
            .off(content, 'mousewheel', stop)
            .off(content, 'MozMousePixelScroll', stop);

          L.DomEvent
            .off(container, 'transitionend',
              this._handleTransitionEvent, this)
            .off(container, 'webkitTransitionEnd',
              this._handleTransitionEvent, this);

          if (this._closeButton && this._close) {
            var close = this._closeButton;

            L.DomEvent.off(close, 'click', this.hide, this);
          }

          return this;
        },

        isVisible: function () {
          return L.DomUtil.hasClass(this._container, 'visible');
        },

        show: function () {
          if (!this.isVisible()) {
            L.DomUtil.addClass(this._container, 'visible');
            if (this.options.autoPan) {
              this._map.panBy([-this.getOffset() / 2, 0], {
                duration: 0.5
              });
            }
            this.fire('show');
          }
        },

        hide: function (e) {
          if (this.isVisible()) {
            L.DomUtil.removeClass(this._container, 'visible');
            if (this.options.autoPan) {
              this._map.panBy([this.getOffset() / 2, 0], {
                duration: 0.5
              });
            }
            this.fire('hide');
          }
          if(e) {
            L.DomEvent.stopPropagation(e);
          }
        },

        toggle: function () {
          if (this.isVisible()) {
            this.hide();
          } else {
            this.show();
          }
        },

        getContainer: function () {
          return this._contentContainer;
        },

        getCloseButton: function () {
          return this._closeButton;
        },

        setContent: function (content) {
          var container = this.getContainer();

          if (typeof content === 'string') {
            container.innerHTML = content;
          } else {
            // clean current content
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }

            container.appendChild(content);
          }

          return this;
        },

        getOffset: function () {
          if (this.options.position === 'right') {
            return -this._container.offsetWidth;
          } else {
            return this._container.offsetWidth;
          }
        },

        _handleTransitionEvent: function (e) {
          if (e.propertyName == 'left' || e.propertyName == 'right')
            this.fire(this.isVisible() ? 'shown' : 'hidden');
        }
      });

      L.control.sidebar = function (placeholder, options) {
        return new L.Control.Sidebar(placeholder, options);
      };


      // leaflet js
      var map = L.map('map');
      map.setView([drupalSettings.view_l, drupalSettings.view_c], 3);
      L.Icon.Default.imagePath = '/modules/custom/leaflet_maps/img';
      let icon = new L.Icon.Default();
      icon.options.shadowSize = [0,0];
      window.icon = icon;
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; OpenStreetMap contributors'
      }).addTo(map);
      var sidebar = L.control.sidebar('sidebar', {
        closeButton: true,
        position: 'right'
      });
      map.addControl(sidebar);
      $("#map").height($(window).height() / 2).width($(window).width() / 2);
      map.invalidateSize();


      let data = drupalSettings.data;

      for (let i = 0; i < data.length; i++) {
        let coordinates = data[i].coordinates;
        let popup_content = L.popup().setContent(data[i].title);
        let marker = new L.marker([coordinates[1], coordinates[0]], {icon: icon})
          .bindPopup(popup_content)
          .addTo(map)
          .on('mouseover', function () {
            this.openPopup();
          })
          .on('mouseout', function () {
            this.closePopup();
          })
          .on('click', function () {
            let sidebar_content = '<div id="sidebar" class="leaflet-control">' +
              '  <h1 class="title">' + data[i].title +  '</h1>' +
              '  <span class="category">' + data[i].category +  '</span>' +
              '  <div class="desc">' + data[i].desc +  '</div>' +
              '</div>';
            $('#sidebar').replaceWith(sidebar_content);
            sidebar.toggle();
          });
      }


      map.on('click', function () {
        sidebar.hide();
      })

    }
  }
})(jQuery, drupalSettings);
