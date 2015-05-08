class Reel

	constructor: (offset, stage) ->
		# reel container simplifies rolling
		@container = new createjs.Container
		@container.x = offset
		stage.addChild @container
		return this

	use: (cards) ->
		@container.removeAllChildren()
		@container.addChild stack = new createjs.Container
		stack.y = 0

		@cardOffsetMap = {}

		for card, i in cards
			offset = cardSpacing + i * (cardHeight + cardSpacing)
			@cardOffsetMap[card.name] = offset
			stackCard = card.clone().set y: offset
			stack.addChild stackCard

		@stackHeight = stack.getBounds().height + cardSpacing

		# create stack clone to allow looping animation
		shadowStack = stack.clone(true)
		# stack is initially placed after the first one
		shadowStack.y = @stackHeight
		@container.addChild shadowStack

		# position the container to start off with the shadow stack
		@container.y = -@stackHeight
		@currentStackIdx = 1

		return

	roll: (cardName, rollCount) ->
		unless cardOffset = @cardOffsetMap[cardName]
			throw new Error "invalid card specified for roll: #{cardName}"

		self = this

		makeRoll = (rollCountRemaining) ->
			# new tween for each roll so it's based on current position
			tween = createjs.Tween.get(self.container, useTicks: yes, override: yes)

			# keep rolling around until the zero is hit
			if rollCountRemaining > 0
				self._tweenRoll tween, self.stackHeight
				tween.call makeRoll, [rollCountRemaining - 1]

			# make last roll to focus selected card to the middle of the reel
			else
				offset = self.stackHeight - cardOffset + (cardHeight / 2) + (2 * cardSpacing)
				self._tweenRoll tween, offset, createjs.Ease.getElasticOut(1,1)

		makeRoll rollCount

	_tweenRoll: (tween, amount, ease) ->
		# calculate target offset for tween and duration for constant speed
		target = @container.y + amount
		duration = (target - @container.y) * rollSpeed
		# my math skills are sort of bad to express this correctly :)
		tween.on 'change', @_checkSwap, this, false, if ease then 4 else 11
		tween.to(y: target, duration, ease)

	_checkSwap: (ev, swapAt) ->
		if ev.target.position > swapAt
			@_swapStack()
			ev.target.removeAllEventListeners 'change'

	_swapStack: ->
		currentStack = @container.children[@currentStackIdx]
		currentStack.y -= (2 * @stackHeight)
		@currentStackIdx = Number(!@currentStackIdx)