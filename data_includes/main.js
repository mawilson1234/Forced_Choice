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

var answer_style = {
	'text-align': 'justify', 
	margin: '0 auto', 
	'margin-bottom': '2em',
	width: '30em'
}

var prompt_style = {
	'text-align': 'justify', 
	margin: '0 auto',
	'margin-top': '3em',
	'margin-bottom': '0.5em',
	width: '30em'
}

Sequence(
	'instructions',
	'preload',
	'preloaded',
	randomize('trial') ,
	SendResults(),
	'end'
)

CheckPreloaded('trial')
	.label('preload')

newTrial('preloaded',
	newText('The images have finished preloading. Click below when you are ready to begin the experiment.')
		.css(centered_justified_style)
		.print()
	,
	
	newButton('Click when you are ready to begin')
		.css('font-family', 'Helvetica, sans-serif')
		.css('font-size', '16px')
		.center()
		.print()
		.wait()
)

newTrial('instructions',
	fullscreen(),
	
	newText(
		`<p>Welcome! In this experiment, you will see either a sentence, an image, or a sentence and an image. Once you have finished reading the sentence and/or looking at the image, you should click the button below them to proceed.</p><p>
			Then, you will see another sentence related to the scenario described by the sentence and/or shown in the image.</p><p>
			Below that will be three sentences. Your task is to choose which of those three sentences has the same meaning as the sentence above.</p><p>
			Try to respond to the questions as quickly and accurately as possible.</p><p>
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

Template('stimuli.csv', currentrow => {
	size = currentrow.IMAGE === 'blank.jpg' ? 0 : 500
	canvas_size = size === 0 ? 0 : 550
	
	return newTrial(
		'trial',
		
		newImage('image', currentrow.IMAGE)
			.size(size, size)
		,
		
		newCanvas('image', canvas_size, canvas_size)
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
		
		newVar('RT')
			.global()
			.set(v => Date.now())
		,
		
		newText('question', currentrow.QUESTION)
			.center()
			.css('text-size', '16px')
			.print()
		,
		
		newText(
			'prompt', 
			'Which sentence has the same meaning as the sentence above? (Click to answer.)'
		)
			.css(prompt_style)
			.print()
		,
		
		newText(currentrow.FIRST_ANSWER_TYPE, '(a) ' + currentrow.FIRST_ANSWER)
			.css(answer_style)
			.print()
		,
		
		newText(currentrow.SECOND_ANSWER_TYPE, '(b) ' + currentrow.SECOND_ANSWER)
			.css(answer_style)
			.print()
		,
		
		newText(currentrow.THIRD_ANSWER_TYPE, '(c) ' + currentrow.THIRD_ANSWER)
			.css(answer_style)
			.print()
		,
		
		newSelector('answer')
			.add(getText('a1'), getText('a2'), getText('a3'))
			.wait()
			.log()
		,
		
		getVar('RT')
			.set(v => Date.now() - v)
	)
		.log('item',			   currentrow.ITEM)
		.log('sentence',		   currentrow.SENTENCE)
		.log('image',			   currentrow.IMAGE)
		.log('condition',		   currentrow.CONDITION)
		.log('question',		   currentrow.QUESTION)
		.log('response_time',      getVar('RT'))
		.log('first_answer',	   currentrow.FIRST_ANSWER)
		.log('second_answer',	   currentrow.SECOND_ANSWER)
		.log('third_answer',	   currentrow.THIRD_ANSWER)
		.log('first_answer_type',  currentrow.FIRST_ANSWER_TYPE)
		.log('second_answer_type', currentrow.SECOND_ANSWER_TYPE)
		.log('third_answer_type',  currentrow.THIRD_ANSWER_TYPE)
})

newTrial('end',
	exitFullscreen()
	,
	
	newText('The is the end of the experiment, you can now close this window. Thank you!')
		.css(centered_justified_style)
		.center()
		.print()
	,
	
	newButton()
		.wait()
)
.setOption('countsForProgressBar', false)