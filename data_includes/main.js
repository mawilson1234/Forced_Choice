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
	'demographics',
	'instructions1',
	'preload',
	'preloaded',
	randomize('preexposure'),
	'instructions2',
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

newTrial('demographics',
	newHtml('demographics', 'background.html')
		.css(centered_justified_style)
		.radioWarning("You must select an option for '%name%'.")
		.inputWarning("You must provide an answer for '%name%'.")
		.print()
		.log()
	,
	
	newButton('Next', 'Next')
		.css('font-family', 'Helvetica, sans-serif')
		.css('font-size', '16px')
		.center()
		.print()
		.wait(
			getHtml('demographics')
				.test.complete()
				.failure(
					getHtml('demographics').warn()
				)
		)
).setOption('countsForProgressBar', false)

newTrial('instructions1',
	fullscreen(),
	
	newText(
		`<p>Welcome! In this experiment, you will first read a series of sentences. Some of the sentences
		 may contain words you don't know. Try to read and understand the sentences as best you can.</p>
		<p>After you have read the sentences, you will be shown a series of pictures, and should pick the word
		that matches what is in the picture.</p>
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

newTrial('instructions2',
	fullscreen(),
	
	newText(
		`<p>You have now finished the first part of the experiment. Next, you will be shown a series of pictures.
		Below each picture will be two words. You may not know some of these words. Try to select the word that 
		you think matches what is in the picture, even if you may not know it.</p>
		`
	)
		.css(centered_justified_style)
		.print()		
	,
	
	newButton('Click when you are ready to continue')
		.css('font-family', 'Helvetica, sans-serif')
		.css('font-size', '16px')
		.center()
		.print()
		.wait()
).setOption('countsForProgressBar', false)

Template('preexposure.csv', currentrow => 
	newTrial(
		'preexposure',
		newText('sentence', currentrow.sentence)
			.css(centered_justified_style)
			.print()
		,
		
		newVar('RT')
			.global()
			.set(v => Date.now())
		,
		
		newButton('Next')
			.center()
			.print()
			.wait()
		,
		
		getVar('RT')
			.set(v => Date.now() - v)
	)
		.log('item',			   currentrow.item)
		.log('sentence',		   currentrow.sentence)
		.log('condition',		   currentrow.condition)
		.log('response_time',      getVar('RT'))
)

Template('stimuli.csv', currentrow => 
	newTrial(
		'trial',
		
		newImage('image', currentrow.image)
			.size(500, 500)
		,
		
		newCanvas('image', 550, 550)
			.center()
			.add('center at 50%', 'middle at 50%', getImage('image'))
			.print()
		,
		
		newText('prompt', 'Which word matches the picture above?')
			.css(prompt_style)
			.print()
		,
		
		newText(currentrow.first_answer, currentrow.first_answer)
			.css(answer_style)
			.print()
		,
		
		newText(currentrow.second_answer, currentrow.second_answer)
			.css(answer_style)
			.print()
		,
		
		newVar('RT')
			.global()
			.set(v => Date.now())
		,
		
		newSelector('answer')
			.add(
				getText(currentrow.first_answer), 
				getText(currentrow.second_answer)
			)
			.shuffle()
			.wait()
			.log()
		,
		
		getVar('RT')
			.set(v => Date.now() - v)
	)
		.log('item',			   currentrow.item)
		.log('image',			   currentrow.image)
		.log('condition',		   currentrow.condition)
		.log('response_time',      getVar('RT'))
		.log('first_answer',	   currentrow.first_answer)
		.log('second_answer',	   currentrow.second_answer)
)

newTrial('end',
	exitFullscreen()
	,
	
	newText('This is the end of the experiment, you can now close this window. Thank you!')
		.css(centered_justified_style)
		.center()
		.print()
	,
	
	newButton()
		.wait()
)
.setOption('countsForProgressBar', false)