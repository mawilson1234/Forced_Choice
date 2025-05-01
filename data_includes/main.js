// This is a PCIbex implementation of a simple self-paced reading task for
// CGSC/LING 496/696 @ University of Delaware

// Michael Wilson, November 2024
// CC-BY

PennController.ResetPrefix(null) // Shorten command names (keep this)
DebugOff()

var v = Math.random()
var preexposure = v > 0.5 ? 'preexposure' : 'nopreexposure';
var instructions_preexposure = `instructions_${preexposure}`
var instructions2_preexposure = `instructions2_${preexposure}`

var centered_justified_style = {
	'text-align': 'justify', 
	margin: '0 auto', 
	'margin-bottom': '3em',
	width: '30em'
}

var answer_style = {
	'text-align': 'center', 
	'font-size': '1.25em',
	margin: '0 auto', 
	'margin-bottom': '2em',
	width: '30em',
	'font-weight': 'bold'
}

var prompt_style = {
	'font-style': 'italic',
	'text-align': 'center', 
	margin: '0 auto',
	'margin-top': '3em',
	'margin-bottom': '2em',
	width: '30em'
}

Sequence(
	'demographics',
	instructions_preexposure,
	'preload',
	'preloaded',
	randomize(preexposure),
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

newTrial('instructions_preexposure',
	fullscreen(),
	
	newText(
		`<p>Welcome! In this experiment, you will first read a series of sentences. Some of the sentences
		 may contain words you don't know. Try to read and understand the sentences as best you can.</p>
		<p>After you have read the sentences, you will be shown a word along with two pictures. You should 
		click on the image that best matches the word.</p>
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

newTrial('instructions2_preexposure',
	newText(
		`<p>You have now finished the first part of the experiment. Next, you will be shown trials with a word 
		and two pictures. You may not know some of the words. Try to click the picture that 
		you think matches the word, even if you may not know that word.</p>
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

newTrial('instructions_nopreexposure',
	fullscreen(),
	
	newText(
		`<p>Welcome! In this experiment, you will be shown a word and two pictures. You may not know 
		some of the words. Try to click the picture that you think matches the word, even if you may 
		not know that word.</p></p>
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
		
		getVar('answer_RT')
			.set(v => Date.now() - v)
		,
		
		newText(
			'prompt', 
			currentrow.question
		)
			.css(prompt_style)
			.print()
		,
		
		newText('first_answer', currentrow.first_answer)
			.css(answer_style)
			.print()
		,
		
		newText('second_answer', currentrow.second_answer)
			.css(answer_style)
			.print()
		,
		
		newText('third_answer', currentrow.third_answer)
			.css(answer_style)
			.print()
		,
		
		newText('fourth_answer', currentrow.fourth_answer)
			.css(answer_style)
			.print()
		,
		
		newVar('answer_RT')
			.global()
			.set(v => Date.now())
		,
		
		newSelector('answer')
			.add(
				getText("first_answer"), 
				getText("second_answer"),
				getText("third_answer"),
				getText("fourth_answer")
			)
			.shuffle()
			.wait()
			.log()
		,
		
		getVar('RT')
			.set(v => Date.now() - v)
	)
		.log('item',			   currentrow.item)
		.log('sentence',		   currentrow.sentence)
		.log('response_time',      getVar('RT'))
		.log('preexposure',        preexposure)
		.log('question',           currentrow.question)
		.log('answer_RT',          getVar('answer_RT'))
		.log('first_answer',       currentrow.first_answer)
		.log('second_answer',      currentrow.second_answer)
		.log('third_answer',       currentrow.third_answer)
		.log('fourth_answer',      currentrow.fourth_answer)
		.log('correct_answer',     currentrow.correct_answer)
)

newTrial('nopreexposure')

Template('stimuli.csv', currentrow => {
	var im1 = 'left_image'
	
	var image1 = currentrow.image1;
	var image2 = currentrow.image2;
	
	// randomize the order of the images
	let n = Math.random();
	if (n >= 0.5) {
		var image2 = currentrow.image1;
		var image1 = currentrow.image2;
	}
	
	return newTrial(
		'trial',
		
		newText('prompt', 'Which picture matches the word?')
			.css(prompt_style)
			.print()
		,
		
		newText('word', currentrow.word)
			.css(answer_style)
			.print()
		,
		
		newImage('left_image', image1)
			.size(500, 500)
		,
		
		newImage('right_image', image2)
			.size(500, 500)
		,
		
		newCanvas('image', 1100, 550)
			.center()
			.add('center at 25%', 'middle at 50%', getImage('left_image'))
			.add('center at 75%', 'middle at 50%', getImage('right_image'))
			.print()
		,
		
		newVar('RT')
			.global()
			.set(v => Date.now())
		,
		
		newSelector('answer')
			.add(
				getImage('left_image'),
				getImage('right_image')
			)
			.center()
			.wait()
			.log()
		,
		
		getVar('RT')
			.set(v => Date.now() - v)
	)
		.log('item',			   currentrow.item)
		.log('left_image',         image1)
		.log('right_image',        image2)
		.log('word',               currentrow.word)
		.log('correct_image',	   currentrow.correct_image)
		.log('response_time',      getVar('RT'))
		.log('preexposure',        preexposure)
})

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