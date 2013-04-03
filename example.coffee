$ ->
	viewport = $ '#griddle'

	data =
		getItem: (n) -> {name:n}
		getLength: -> 1000

	cell_size =
		width: 200
		height: 200

	render_cell = (item, {left, top}) ->
		"""<div class="cell" style="left:#{left}px; top:#{top}px">
				#{item.name}
			</div>
		"""

	window.grid = new SlickGriddle viewport, data, cell_size, render_cell
	$(window).resize -> grid.resize()