/**
 *
 * @author Patrick Künzl <contact@paaddy.de>
 */
(function (OpenSeadragon) {
  if (!OpenSeadragon.version || OpenSeadragon.version.major < 2) {
    throw new Error('This version of OpenSeadragonScalebar requires ' +
      'OpenSeadragon version 2.0.0+');
  }

  OpenSeadragon.Viewer.prototype.rotationDetails = function (options) {
    if (!this.rotationDetailsInstance) {
      options = options || {};
      this.rotationDetailsInstance = new OpenSeadragon.RotationDetails(options);
    }
  };

  OpenSeadragon.RotationDetailsLocation = {
    NONE: 0,
    TOP_LEFT: 1,
    TOP_RIGHT: 2,
    BOTTOM_RIGHT: 3,
    BOTTOM_LEFT: 4,
  };

  OpenSeadragon.RotationDetails = function (options) {
    options = options || {};
    if (!options.viewer) {
      throw new Error('A viewer must be specified.');
    }
    this.viewer = options.viewer;

    // OPTIONS
    this.degree = options.degree || 0;
    this.location = options.location || OpenSeadragon.RotationDetailsLocation.BOTTOM_RIGHT;
    this.xOffset = options.xOffset || 5;
    this.yOffset = options.yOffset || 5;
    this.theme = options.theme || 'dark';
    this.size = options.size || '200px';
    this.fontSize = options.fontSize || '2.5vw';
    this.stayInsideImage = options.stayInsideImage || false;
    this.additionalPositioning = options.positioning || false;
    this.specialEvents = options.specialEvents || false;

    // PLUGIN SPECIFIC
    this.isDragged = false;

    const self = this;

    this.viewer.addHandler('open', () => {
      self.createElements();
      self.initEventListeners();
      self.initFn();
      self.initTheme();
      this.updatePosition(this.getLocation());
    });

    this.viewer.addHandler('rotate', (event) => {
      self.setDegree(event.degrees, null, true);
    });

    this.viewer.addHandler('resize', () => {
      this.updatePosition(this.getLocation());
    });
  };

  OpenSeadragon.RotationDetails.prototype = {

    createElements: function () {
      this.wrapper = document.createElement('div');
      this.wrapper.setAttribute('class', "rotation-ctrl");
      this.control = document.createElement('div');
      this.dotted = document.createElement('div');
      this.point = document.createElement('span');
      this.label = document.createElement('span');
      this.label_text = document.createTextNode(this.degree);
      this.point = document.createElement('div');

      this.control.appendChild(this.point);
      this.dotted.appendChild(this.control);
      this.wrapper.appendChild(this.dotted);
      this.wrapper.appendChild(this.label);
      this.viewer.container.appendChild(this.wrapper);
      this.label.appendChild(this.label_text);
    },

    updatePosition: function (location) {
      if (this.additionalPositioning) {
        let elem;
        let change;
        switch (this.additionalPositioning.direction) {
          case 'to-the-left':
            elem = this.additionalPositioning.element;
            change = $(elem.element).width();
            location.x -= (change + 8);
            break;
          case 'to-the-right':
            elem = this.additionalPositioning.element;
            change = $(elem.element).width();
            location.x += (change + 8);
            break;
          case 'above':
            elem = this.additionalPositioning.element;
            change = $(elem.element).height();
            location.y -= (change + 8);
            break;
          case 'below':
            elem = this.additionalPositioning.element;
            change = $(elem.element).height();
            location.y += (change + 8);
            break;
          default:
            throw new Error('Positioning is invalid');
        }
      }

      this.wrapper.style.left = `${location.x}px`;
      this.wrapper.style.top = `${location.y}px`;
    },

    initEventListeners: function () {
      $(this.point).on('dragstart', (event) => {
        event.stopImmediatePropagation();
        this.isDragged = true;
        const crt = this.point.cloneNode(true);
        crt.style.display = 'none';
        document.body.appendChild(crt);
        event.originalEvent.dataTransfer.setDragImage(crt, 0, 0);
      });
      $(this.wrapper).on('dragover', event => {
        event.stopImmediatePropagation();
        this.calcAngle(event, $(this.control));
      });

      $(this.point).on('mousedown', (event) => {
        if ((" " + this.point.className + " ").replace(/[\n\t]/g, " ").indexOf(" openseadragon-extension ") > -1) {
          OpenSeadragon.cancelEvent(event);
          return false;
        }
      });

      $(this.dotted).on('click', event => this.calcAngle(event, $(this.control), false, true));
    },

    initFn: function () {
      this.rotateViewport = this._debounceFn(this.rotateViewport);
    },

    initTheme() {
      switch (this.theme) {
        case 'dark':
        default:
          this.wrapper.style.width = this.size;
          this.wrapper.style.height = this.size;
          this.wrapper.style.position = 'absolute';
          this.wrapper.style.backgroundColor = '#333';
          this.wrapper.style.display = 'flex';
          this.wrapper.style.alignItems = 'center';
          this.wrapper.style.justifyContent = 'center';

          this.dotted.style.width = '90%';
          this.dotted.style.height = '90%';
          this.dotted.style.display = 'flex';
          this.dotted.style.alignItems = 'center';
          this.dotted.style.justifyContent = 'center';
          this.dotted.style.borderRadius = '90%';

          this.dotted.style.backgroundImage = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 400 400' version='1.1' xmlns='http://www.w3.org/2000/svg'><circle cx='200' cy='200' r='188' stroke='%23fff' stroke-width='17' stroke-dasharray='0 49.2' stroke-linecap='round' fill='transparent'/></svg>")`;
          this.dotted.style.backgroundSize = '100% 100%';
          this.dotted.style.backgroundRepeat = 'no-repeat';

          this.control.style.width = '80%';
          this.control.style.height = '80%';
          this.control.style.position = 'relative';
          this.control.style.borderRadius = '50%';
          this.control.style.backgroundColor = '#f8f8ff';
          this.control.style.display = 'flex';
          this.control.style.alignItems = 'flex-start';
          this.control.style.justifyContent = 'center';

          this.point.draggable = true;
          this.point.className += 'openseadragon-extension';
          this.point.style.width = '15%';
          this.point.style.height = '15%';
          this.point.style.position = 'absolute';
          this.point.style.top = '15px';
          this.point.style.borderRadius = '50%';
          this.point.style.backgroundColor = '#333';

          this.label.style.position = 'absolute';
          this.label.style.fontSize = this.fontSize;
          this.label.style.color = '#333';
      }
    },

    updateLabel: function () {
      this.label.innerHTML = this.degree;
    },

    calcAngle: function (e, elem, parent, priority = false) {
      if (!this.isDragged && !priority) {
        return false;
      }

      parent = parent || $(this.wrapper);

      const offset = $(parent).offset();

      const centerX = ($(parent).width() * 0.1) + ($(elem).width() / 2) + offset.left;
      const centerY = ($(parent).height() * 0.1) + ($(elem).height() / 2) + offset.top;
      let degree = Math.atan2(e.pageX - centerX, -(e.pageY - centerY)) * (180 / Math.PI);
      degree = (degree + 360) % 360;

      this.setDegree(degree, elem);
    },

    setDegree: function (degree, elem, silent = false) {
      degree = this.roundDegree(degree);
      this.degree = degree;
      elem = elem || $(this.control);
      this.rotateDiv(degree, elem);
      if (!silent)
        this.rotateViewport();
      this.updateLabel();
    },

    roundDegree: function (degree) {
      return Math.round(degree);
    },

    rotateViewport: function (degree) {
      degree = degree || this.degree;
      this.viewer.viewport.setRotation(degree);
    },

    rotateDiv: function (degree, elem) {
      $(elem).css('transform', `rotate(${degree}deg)`);
      $(elem).css('-webkit-transform', `rotate(${degree}deg)`);
      $(elem).css('-o-transform', `rotate(${degree}deg)`);
      $(elem).css('-ms-transform', `rotate(${degree}deg)`);
    },

    getLocation: function () {
      if (this.location === OpenSeadragon.RotationDetailsLocation.TOP_LEFT) {
        let x = 0;
        let y = 0;
        if (this.stayInsideImage) {
          const pixel = this.viewer.viewport.pixelFromPoint(
            new OpenSeadragon.Point(0, 0), true);
          if (!this.viewer.wrapHorizontal) {
            x = Math.max(pixel.x, 0);
          }
          if (!this.viewer.wrapVertical) {
            y = Math.max(pixel.y, 0);
          }
        }
        return new OpenSeadragon.Point(x + this.xOffset, y + this.yOffset);
      }
      if (this.location === OpenSeadragon.RotationDetailsLocation.TOP_RIGHT) {
        const wrapperWidth = this.wrapper.offsetWidth;
        const container = this.viewer.container;
        let x = container.offsetWidth - wrapperWidth;
        let y = 0;
        if (this.stayInsideImage) {
          const pixel = this.viewer.viewport.pixelFromPoint(
            new OpenSeadragon.Point(1, 0), true);
          if (!this.viewer.wrapHorizontal) {
            x = Math.min(x, pixel.x - wrapperWidth);
          }
          if (!this.viewer.wrapVertical) {
            y = Math.max(y, pixel.y);
          }
        }
        return new OpenSeadragon.Point(x - this.xOffset, y + this.yOffset);
      }
      if (this.location === OpenSeadragon.RotationDetailsLocation.BOTTOM_RIGHT) {
        const wrapperWidth = this.wrapper.offsetWidth;
        const wrapperHeight = this.wrapper.offsetHeight;
        const container = this.viewer.container;
        let x = container.offsetWidth - wrapperWidth;
        let y = container.offsetHeight - wrapperHeight;
        if (this.stayInsideImage) {
          const pixel = this.viewer.viewport.pixelFromPoint(
            new OpenSeadragon.Point(1, 1 / this.viewer.source.aspectRatio),
            true);
          if (!this.viewer.wrapHorizontal) {
            x = Math.min(x, pixel.x - wrapperWidth);
          }
          if (!this.viewer.wrapVertical) {
            y = Math.min(y, pixel.y - wrapperHeight);
          }
        }
        return new OpenSeadragon.Point(x - this.xOffset, y - this.yOffset);
      }
      if (this.location === OpenSeadragon.RotationDetailsLocation.BOTTOM_LEFT) {
        const wrapperHeight = this.wrapper.offsetHeight;
        const container = this.viewer.container;
        let x = 0;
        let y = container.offsetHeight - wrapperHeight;
        if (this.stayInsideImage) {
          const pixel = this.viewer.viewport.pixelFromPoint(
            new OpenSeadragon.Point(0, 1 / this.viewer.source.aspectRatio),
            true);
          if (!this.viewer.wrapHorizontal) {
            x = Math.max(x, pixel.x);
          }
          if (!this.viewer.wrapVertical) {
            y = Math.min(y, pixel.y - wrapperHeight);
          }
        }
        return new OpenSeadragon.Point(x + this.xOffset, y - this.yOffset);
      }

      return undefined;
    },

    _debounceFn: function (fn, wait, immediate) {
      let timeout;
      return function (...args) {
        const context = this;
        const later = function () {
          timeout = null;
          if (!immediate) fn.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) fn.apply(context, args);
      };
    }
  };

}(OpenSeadragon));
