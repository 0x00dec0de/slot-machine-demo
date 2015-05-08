knownCards = [
	'JC', 'JD', 'JH', 'JS'
	'QC', 'QD', 'QH', 'QS'
	'KC', 'KD', 'KH', 'KS'
	'AC', 'AD', 'AH', 'AS'
]

# X offset for reels
reelOffset = [0, 244, 488, 732, 976]

# number of cards in reel
reelSize = 6

# lower number makes rolling faster
rollSpeed = 0.01

# space between cards
cardSpacing = 5

# height of the single card
cardHeight = 312

# to randomize when to start rolling single reel after load
rollStartMin = 200
rollStartMax = 2000

# to randomize how many rolls to do before selected card is shown
rollCountMin = 3
rollCountMax = 7