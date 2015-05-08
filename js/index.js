var Reel, cardHeight, cardSpacing, getRandomInt, init, knownCards, loadAssets, loadCards, positionCanvas, randomizeCards, reelOffset, reelSize, rollCountMax, rollCountMin, rollSpeed, rollStartMax, rollStartMin, setupCanvas;

init = function(err, _arg) {
  var assets, bootCards, cardNames, i, reels, stage;
  assets = _arg[0];
  if (err) {
    return console.error(err.stack || err);
  }
  createjs.Ticker.timingMode = 'raf';
  createjs.Ticker.on('tick', function() {
    return stage.update();
  });
  stage = new createjs.Stage(setupCanvas());
  bootCards = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; _i < 6; i = ++_i) {
      _results.push(new createjs.Bitmap(assets.back));
    }
    return _results;
  })();
  reels = reelOffset.map(function(reelX) {
    var reel;
    reel = new Reel(reelX, stage);
    reel.use(bootCards);
    reel.container.y = -(reel.stackHeight + (cardHeight / 2) + (2 * cardSpacing));
    return reel;
  });
  cardNames = randomizeCards();
  return loadCards(cardNames, function(cards) {
    var reel, start, _i, _len, _results;
    start = function(reel) {
      var cardName, rollCount;
      reel.use(cards);
      cardName = cardNames[getRandomInt(0, reelSize - 1)];
      rollCount = getRandomInt(rollCountMin, rollCountMax);
      return reel.roll(cardName, rollCount);
    };
    _results = [];
    for (i = _i = 0, _len = reels.length; _i < _len; i = ++_i) {
      reel = reels[i];
      _results.push(setTimeout(start.bind(null, reel), getRandomInt(rollStartMin, rollStartMax)));
    }
    return _results;
  });
};

randomizeCards = function() {
  var idx, randomIdx, result, _i;
  result = new Array(reelSize);
  for (idx = _i = 0; 0 <= reelSize ? _i < reelSize : _i > reelSize; idx = 0 <= reelSize ? ++_i : --_i) {
    randomIdx = getRandomInt(0, knownCards.length);
    result[idx] = knownCards.splice(randomIdx, 1)[0];
  }
  return result;
};

getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

setupCanvas = function() {
  var canvasElement, positionCb, tableElement;
  tableElement = document.getElementById('game-table');
  canvasElement = document.getElementById('game');
  canvasElement.width = 1198;
  canvasElement.height = 667;
  positionCb = positionCanvas.bind(null, tableElement, canvasElement);
  createjs.Ticker.on('tick', positionCb);
  return canvasElement;
};

positionCanvas = function(tableElement, canvasElement) {
  canvasElement.style.left = tableElement.offsetLeft + 170 + 'px';
  return canvasElement.style.top = tableElement.offsetTop + 141 + 'px';
};

loadCards = function(names, cb) {
  var manifest;
  manifest = names.map(function(name) {
    return "" + name + ".png";
  });
  return loadAssets(manifest, function(err, assets) {
    var cards;
    cards = names.map(function(name) {
      var card;
      card = new createjs.Bitmap(assets["" + name + ".png"]);
      card.name = name;
      return card;
    });
    return cb(cards);
  });
};

loadAssets = function(manifest, cb) {
  var loadAssets$complete, loadAssets$error, queue;
  queue = new createjs.LoadQueue(false, 'assets/');
  queue.addEventListener('complete', loadAssets$complete = function() {
    var file, result, _i, _len;
    result = {};
    for (_i = 0, _len = manifest.length; _i < _len; _i++) {
      file = manifest[_i];
      if (file.id) {
        result[file.id] = queue.getResult(file.id);
      } else {
        result[file] = queue.getResult(file);
      }
    }
    return cb(null, result);
  });
  queue.addEventListener('error', loadAssets$error = function(err) {
    return cb(err);
  });
  return queue.loadManifest(manifest);
};

async.parallel([
  function(cb) {
    return loadAssets([
      {
        id: 'back',
        src: 'Back.png'
      }, 'Table.png'
    ], cb);
  }, function(cb) {
    return document.addEventListener('DOMContentLoaded', function() {
      return cb();
    });
  }
], init);

knownCards = ['JC', 'JD', 'JH', 'JS', 'QC', 'QD', 'QH', 'QS', 'KC', 'KD', 'KH', 'KS', 'AC', 'AD', 'AH', 'AS'];

reelOffset = [0, 244, 488, 732, 976];

reelSize = 6;

rollSpeed = 0.01;

cardSpacing = 5;

cardHeight = 312;

rollStartMin = 200;

rollStartMax = 2000;

rollCountMin = 3;

rollCountMax = 7;

Reel = (function() {
  function Reel(offset, stage) {
    this.container = new createjs.Container;
    this.container.x = offset;
    stage.addChild(this.container);
    return this;
  }

  Reel.prototype.use = function(cards) {
    var card, i, offset, shadowStack, stack, stackCard, _i, _len;
    this.container.removeAllChildren();
    this.container.addChild(stack = new createjs.Container);
    stack.y = 0;
    this.cardOffsetMap = {};
    for (i = _i = 0, _len = cards.length; _i < _len; i = ++_i) {
      card = cards[i];
      offset = cardSpacing + i * (cardHeight + cardSpacing);
      this.cardOffsetMap[card.name] = offset;
      stackCard = card.clone().set({
        y: offset
      });
      stack.addChild(stackCard);
    }
    this.stackHeight = stack.getBounds().height + cardSpacing;
    shadowStack = stack.clone(true);
    shadowStack.y = this.stackHeight;
    this.container.addChild(shadowStack);
    this.container.y = -this.stackHeight;
    this.currentStackIdx = 1;
  };

  Reel.prototype.roll = function(cardName, rollCount) {
    var cardOffset, makeRoll, self;
    if (!(cardOffset = this.cardOffsetMap[cardName])) {
      throw new Error("invalid card specified for roll: " + cardName);
    }
    self = this;
    makeRoll = function(rollCountRemaining) {
      var offset, tween;
      tween = createjs.Tween.get(self.container, {
        useTicks: true,
        override: true
      });
      if (rollCountRemaining > 0) {
        self._tweenRoll(tween, self.stackHeight);
        return tween.call(makeRoll, [rollCountRemaining - 1]);
      } else {
        offset = self.stackHeight - cardOffset + (cardHeight / 2) + (2 * cardSpacing);
        return self._tweenRoll(tween, offset, createjs.Ease.getElasticOut(1, 1));
      }
    };
    return makeRoll(rollCount);
  };

  Reel.prototype._tweenRoll = function(tween, amount, ease) {
    var duration, target;
    target = this.container.y + amount;
    duration = (target - this.container.y) * rollSpeed;
    tween.on('change', this._checkSwap, this, false, ease ? 4 : 11);
    return tween.to({
      y: target
    }, duration, ease);
  };

  Reel.prototype._checkSwap = function(ev, swapAt) {
    if (ev.target.position > swapAt) {
      this._swapStack();
      return ev.target.removeAllEventListeners('change');
    }
  };

  Reel.prototype._swapStack = function() {
    var currentStack;
    currentStack = this.container.children[this.currentStackIdx];
    currentStack.y -= 2 * this.stackHeight;
    return this.currentStackIdx = Number(!this.currentStackIdx);
  };

  return Reel;

})();
