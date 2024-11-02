// This is a PCIbex implementation of a simple self-paced reading task for
// CGSC/LING 496/696 @ University of Delaware

// Michael Wilson, November 2024
// CC-BY

PennController.ResetPrefix(null) // Shorten command names (keep this)
DebugOff()

var centered_justified_style = {
	'text-align': 'justify', 
	margin: '0 auto', 
	'margin-bottom': '3em',
	width: '30em'
}

Sequence(
	'instructions',
	randomize('trial') ,
	SendResults(),
	'end'
)

newTrial('instructions',
	fullscreen(),
	
	newText(
		`<p>Welcome! In this experiment, we want you to read sentences one word at a time. When you are finished reading a word, push the space bar to show the next word.</p><p>
			Afterward, you will see a question about the sentence you read.</p><p>
			Push the "f" key if you think the answer on the left is correct, and "j" if you think the answer on the right is correct.</p><p>
			Try to read at a natural pace, and respond to the questions as quickly and accurately as possible.</p><p>
		`
	)
		.css(centered_justified_style)
		.print()		
	,
	
	newButton('Click when you are ready to begin')
		.css('font-family', 'Helvetica, sans-serif')
		.css('font-size', '16px')
		.center()
		.print()
		.wait()
).setOption('countsForProgressBar', false)

Template('stimuli.csv', currentrow => 
	newTrial(
		'trial',
		
		newImage('image', currentrow.IMAGE)
			.size(200, 200)
		,
		
		newCanvas('image', 300, 300)
			.center()
			.add('center at 50%', 'middle at 50%', getImage('image'))
			.print()
		,
		
		newText('sentence', currentrow.SENTENCE)
			.css(centered_justified_style)
			.print()
		,
		
		newButton('Next')
			.center()
			.print()
			.wait()
		,
		
		getCanvas('image')
			.remove()
		,
		
		getText('sentence')
			.remove()
		,
		
		newText('question', currentrow.QUESTION)
			.css(centered_justified_style)
			.print()
		,
		
		newText('a1', currentrow.FIRST_ANSWER)
			print()
		,
		
		newText('a2', currentrow.SECOND_ANSWER)
			print()
		,
		
		newText('a3', currentrow.THIRD_ANSWER)
			print()
		,
		
		newSelector('answer')
			.add(getText('a1'), getText('a2'), getText('a3'))
			.wait()
			.log()
	)
		.log('item',               currentrow.ITEM)
		.log('sentence',           currentrow.SENTENCE)
		.log('image',              currentrow.IMAGE)
		.log('condition',          currentrow.CONDITION)
		.log('question',           currentrow.QUESTION)
		.log('first_answer',       currentrow.FIRST_ANSWER)
		.log('second_answer',      currentrow.SECOND_ANSWER)
		.log('third_answer',       currentrow.THIRD_ANSWER)
		.log('first_answer_type',  currentrow.FIRST_ANSWER_TYPE)
		.log('second_answer_type', currentrow.SECOND_ANSWER_TYPE)
		.log('third_answer_type',  currentrow.THIRD_ANSWER_TYPE)
)

newTrial('end',
	exitFullscreen()
	,
	
	newText('The is the end of the experiment, you can now close this window. Thank you!')
		.css(trial_style)
		.center()
		.print('center at 50%', 'bottom at 80%')
	,
	
	newButton()
		.wait()
)
.setOption('countsForProgressBar', false)