init = (err, [assets]) ->
	return console.error err.stack or err if err

	createjs.Ticker.timingMode = 'raf'
	createjs.Ticker.on 'tick', -> stage.update()

	stage = new createjs.Stage setupCanvas()

	bootCards = (new createjs.Bitmap(assets.back) for i in [0...6])

	reels = reelOffset.map (reelX) ->
		reel = new Reel(reelX, stage)
		reel.use bootCards
		reel.container.y = -(reel.stackHeight + (cardHeight / 2) + (2 * cardSpacing))
		return reel

	cardNames = randomizeCards()

	loadCards cardNames, (cards) ->
		start = (reel) ->
			reel.use cards
			cardName = cardNames[getRandomInt(0, reelSize - 1)]
			rollCount = getRandomInt(rollCountMin, rollCountMax)
			reel.roll cardName, rollCount

		for reel, i in reels
			setTimeout start.bind(null, reel), getRandomInt rollStartMin, rollStartMax

randomizeCards = ->
	result = new Array(reelSize)
	for idx in [0...reelSize]
		randomIdx = getRandomInt 0, knownCards.length
		result[idx] = knownCards.splice(randomIdx, 1)[0]
	return result

getRandomInt = (min, max) ->
	Math.floor(Math.random() * (max - min)) + min

setupCanvas = ->
	tableElement = document.getElementById 'game-table'
	canvasElement = document.getElementById 'game'
	canvasElement.width = 1198
	canvasElement.height = 667
	positionCb = positionCanvas.bind null, tableElement, canvasElement
	createjs.Ticker.on 'tick', positionCb
	return canvasElement

positionCanvas = (tableElement, canvasElement) ->
	canvasElement.style.left = tableElement.offsetLeft + 170 + 'px'
	canvasElement.style.top = tableElement.offsetTop + 141 + 'px'

loadCards = (names, cb) ->
	manifest = names.map (name) ->
		return "#{name}.png"
	loadAssets manifest, (err, assets) ->
		cards = names.map (name) ->
			card = new createjs.Bitmap assets["#{name}.png"]
			card.name = name
			return card
		cb cards

loadAssets = (manifest, cb) ->
	queue = new createjs.LoadQueue false, 'assets/'
	queue.addEventListener 'complete', loadAssets$complete = ->
		result = {}
		for file in manifest
			if file.id then result[file.id] = queue.getResult file.id
			else result[file] = queue.getResult file
		cb null, result
	queue.addEventListener 'error', loadAssets$error = (err) ->
		cb err
	queue.loadManifest manifest

# Kick off
async.parallel [
	(cb) -> loadAssets [id: 'back', src: 'Back.png', 'Table.png'], cb
	(cb) -> document.addEventListener 'DOMContentLoaded', -> cb()
], init