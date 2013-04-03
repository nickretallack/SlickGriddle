delay = (a,b) -> setTimeout b,a

class SlickGriddle
    constructor:(@container, @data, @cell_size, @render_cell, @post_render_cell) ->
        @container.css position:'absolute', top:0, bottom:0, left:0, right:0, overflow:'auto'
        @canvas = $ """<div class="griddle-canvas"></div>"""
        @container.append @canvas
        @canvas_node = @canvas[0]
        @node_cache = {}
        @postProcessedItems = {}

        # start drawing
        @resize()
        @animate()

    resize: ->
        @viewport_height = @container.height()
        @items_per_row = Math.floor @container.width() / @cell_size.width
        @rows_visible = Math.ceil @viewport_height / @cell_size.height
        @invalidate()

    calculate_stuff: ->
        @data_length = @getDataLength()
        @rows_needed = Math.ceil @data_length / @items_per_row
        @canvas_height = @cell_size.height * @rows_needed
        @canvas.css
            height:@canvas_height

    getDataLength: -> if @data.getLength? then @data.getLength() else @data.length
    getDataItem: (index) -> if @data.getItem? then @data.getItem(index) else @data[index]

    animate: ->
        @render()
        delay 500, => @animate()

    cleanupNodes: (rangeToKeep) ->
        for item_index of @node_cache
            unless rangeToKeep.top <= Math.floor(item_index / @items_per_row) <= rangeToKeep.bottom
                @uncacheNode item_index

    invalidate: ->
        @postProcessedItems = {}

        for item_index of @node_cache
            @uncacheNode item_index
        
        @calculate_stuff()
        @render()

    uncacheNode: (index) ->
        node = @node_cache[index]
        unless node?
            console.log "wtf", index
            console.log "wtf", index
        @canvas_node.removeChild node
        delete @node_cache[index]
        delete @postProcessedItems[index]

    postProcess: ->
        for item_index, node of @node_cache
            continue if @postProcessedItems[item_index]
            item = @getDataItem item_index
            @post_render_cell node, item_index, item
            @postProcessedItems[item_index] = true

    render: ->
        stringArray = []
        node_indexes = []
        render_range = @getRenderRange()
        @cleanupNodes render_range
        for row_index in [render_range.top..render_range.bottom]
            for column_index in [0...@items_per_row]
                item_index = row_index * @items_per_row + column_index
                continue if @node_cache[item_index]?
                break if item_index >= @data_length
                node_indexes.push item_index

                item = @getDataItem item_index
                position =
                    top:row_index * @cell_size.height
                    left:column_index * @cell_size.width
                stringArray.push @render_cell item, position
                # NOTE: all strings should be trimmed or unwanted text nodes will appear

        temporaryNode = document.createElement 'div'
        temporaryNode.innerHTML = stringArray.join ''

        for data_index in node_indexes
            @node_cache[data_index] = @canvas_node.appendChild temporaryNode.firstChild
            # The children of the temporary node are removed from it
            # when they are appended to another node

        if @post_render_cell?
            delay 500, => @postProcess()
    
    getVisibleRange: ->
        scrollTop = @container.scrollTop()
        top: Math.floor scrollTop / @cell_size.height
        bottom: Math.ceil (scrollTop + @viewport_height) / @cell_size.height

    getRenderRange: ->
        buffer = @rows_visible
        range = @getVisibleRange()
        top: Math.max 0, range.top - buffer
        bottom: Math.min @rows_needed, range.bottom + buffer

window.SlickGriddle = SlickGriddle
