(function() {
  var SlickGriddle;

  SlickGriddle = (function() {

    function SlickGriddle(container, data, cell_size, render_cell, post_render_cell) {
      this.container = container;
      this.data = data;
      this.cell_size = cell_size;
      this.render_cell = render_cell;
      this.post_render_cell = post_render_cell;
      this.container.css({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'auto'
      });
      this.canvas = $("<div class=\"griddle-canvas\"></div>");
      this.container.append(this.canvas);
      this.canvas_node = this.canvas[0];
      this.node_cache = {};
      this.postProcessedItems = {};
      this.resize();
      this.animate();
    }

    SlickGriddle.prototype.resize = function() {
      this.viewport_height = this.container.height();
      this.items_per_row = Math.floor(this.container.width() / this.cell_size.width);
      this.rows_visible = Math.ceil(this.viewport_height / this.cell_size.height);
      return this.invalidate();
    };

    SlickGriddle.prototype.calculate_stuff = function() {
      this.data_length = this.getDataLength();
      this.rows_needed = Math.ceil(this.data_length / this.items_per_row);
      this.canvas_height = this.cell_size.height * this.rows_needed;
      return this.canvas.css({
        height: this.canvas_height
      });
    };

    SlickGriddle.prototype.getDataLength = function() {
      if (this.data.getLength != null) {
        return this.data.getLength();
      } else {
        return this.data.length;
      }
    };

    SlickGriddle.prototype.getDataItem = function(index) {
      if (this.data.getItem != null) {
        return this.data.getItem(index);
      } else {
        return this.data[index];
      }
    };

    SlickGriddle.prototype.animate = function() {
      var _this = this;
      this.render();
      return delay(500, function() {
        return _this.animate();
      });
    };

    SlickGriddle.prototype.cleanupNodes = function(rangeToKeep) {
      var item_index, _ref, _results;
      _results = [];
      for (item_index in this.node_cache) {
        if (!((rangeToKeep.top <= (_ref = Math.floor(item_index / this.items_per_row)) && _ref <= rangeToKeep.bottom))) {
          _results.push(this.uncacheNode(item_index));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SlickGriddle.prototype.invalidate = function() {
      var item_index;
      this.postProcessedItems = {};
      for (item_index in this.node_cache) {
        this.uncacheNode(item_index);
      }
      this.calculate_stuff();
      return this.render();
    };

    SlickGriddle.prototype.uncacheNode = function(index) {
      var node;
      node = this.node_cache[index];
      if (node == null) {
        console.log("wtf", index);
        console.log("wtf", index);
      }
      this.canvas_node.removeChild(node);
      delete this.node_cache[index];
      return delete this.postProcessedItems[index];
    };

    SlickGriddle.prototype.postProcess = function() {
      var item, item_index, node, _ref, _results;
      _ref = this.node_cache;
      _results = [];
      for (item_index in _ref) {
        node = _ref[item_index];
        if (this.postProcessedItems[item_index]) continue;
        item = this.getDataItem(item_index);
        this.post_render_cell(node, item_index, item);
        _results.push(this.postProcessedItems[item_index] = true);
      }
      return _results;
    };

    SlickGriddle.prototype.render = function() {
      var column_index, data_index, item, item_index, node_indexes, position, render_range, row_index, stringArray, temporaryNode, _i, _len, _ref, _ref2, _ref3,
        _this = this;
      stringArray = [];
      node_indexes = [];
      render_range = this.getRenderRange();
      this.cleanupNodes(render_range);
      for (row_index = _ref = render_range.top, _ref2 = render_range.bottom; _ref <= _ref2 ? row_index <= _ref2 : row_index >= _ref2; _ref <= _ref2 ? row_index++ : row_index--) {
        for (column_index = 0, _ref3 = this.items_per_row; 0 <= _ref3 ? column_index < _ref3 : column_index > _ref3; 0 <= _ref3 ? column_index++ : column_index--) {
          item_index = row_index * this.items_per_row + column_index;
          if (this.node_cache[item_index] != null) continue;
          if (item_index >= this.data_length) break;
          node_indexes.push(item_index);
          item = this.getDataItem(item_index);
          position = {
            top: row_index * this.cell_size.height,
            left: column_index * this.cell_size.width
          };
          stringArray.push(this.render_cell(item, position));
        }
      }
      temporaryNode = document.createElement('div');
      temporaryNode.innerHTML = stringArray.join('');
      for (_i = 0, _len = node_indexes.length; _i < _len; _i++) {
        data_index = node_indexes[_i];
        this.node_cache[data_index] = this.canvas_node.appendChild(temporaryNode.firstChild);
      }
      return delay(500, function() {
        return _this.postProcess();
      });
    };

    SlickGriddle.prototype.getVisibleRange = function() {
      var scrollTop;
      scrollTop = this.container.scrollTop();
      return {
        top: Math.floor(scrollTop / this.cell_size.height),
        bottom: Math.ceil((scrollTop + this.viewport_height) / this.cell_size.height)
      };
    };

    SlickGriddle.prototype.getRenderRange = function() {
      var buffer, range;
      buffer = this.rows_visible;
      range = this.getVisibleRange();
      return {
        top: Math.max(0, range.top - buffer),
        bottom: Math.min(this.rows_needed, range.bottom + buffer)
      };
    };

    return SlickGriddle;

  })();

  window.SlickGriddle = SlickGriddle;

}).call(this);
