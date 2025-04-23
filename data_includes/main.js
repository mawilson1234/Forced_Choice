// This is a PCIbex implementation of a simple self-paced reading task for
// CGSC/LING 496/696 @ University of Delaware

// Michael Wilson, April 2025
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
	randomize('trial') ,
	SendResults(),
	'end'
)

newTrial('instructions',
	fullscreen(),
	
	newText(
		`<p>Welcome! In this experiment, you will see a sentence. Once you have finished reading 
			and understanding the sentence, you should click the button below to proceed.</p>
		<p>Then, you will complete a short question about math or unscrambling a word. When you've entered
		   your response, you will then answer a question about the sentence you read beforehand.</p>
		<p>Try to respond to the questions as quickly and accurately as possible.</p>
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
		
		newVar('RT_sentence')
			.global()
			.set(v => Date.now())
		,
		
		newText('sentence', currentrow.sentence)
			.css(centered_justified_style)
			.print()
		,
		
		newButton('Next')
			.center()
			.print()
			.wait()
		,
		
		getVar('RT_sentence')
			.set(v => Date.now() - v)
		,
		
		getText('sentence')
			.remove()
		,
		
		getButton('Next')
			.remove()
		,
		
		newVar('RT_distractor')
			.global()
			.set(v => Date.now())
		,
		
		newText('distractor', currentrow.distractor_question)
			.center()
			.css('text-size', '16px')
			.print()
		,
		
		newTextInput('distractor_response')
			.css(centered_justified_style)
			.log()
			.lines(1)
			.print()
			.wait()
		,
		
		getVar('RT_distractor')
			.set(v => Date.now() - v)
		,
		
		getText('distractor')
			.remove()
		,
		
		getTextInput('distractor_response')
			.remove()
		,
		
		newHtml('mc_question', currentrow.mc_question)
			.css(centered_justified_style)
			.print()
			.log()
		,
		
		newButton('Next2', 'Next')
			.css('font-family', 'Helvetica, sans-serif')
			.css('font-size', '16px')
			.center()
			.print()
			.wait()
	)
		.log('item',			         currentrow.item)
		.log('sentence',		         currentrow.sentence)
		.log('condition',		         currentrow.condition)
		.log('distractor_question',      currentrow.distractor_question)
		.log('distractor_answer',        currentrow.distractor_answer)
		.log('group',                    currentrow.group)
		.log('reading_time_sentence',    getVar('RT_sentence'))
		.log('response_time_distractor', getVar('RT_distractor'))
		.log('response_time_mc',         getVar('RT_mc'))
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