// This is a PCIbex implementation of a simple self-paced reading task for
// CGSC/LING 496/696 @ University of Delaware

// Michael Wilson, April 2025
// CC-BY

PennController.ResetPrefix(null) // Shorten command names (keep this)
DebugOff()

/* This lets us randomly shuffle the order of the mc responses.
   From https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
*/
function shuffle(array) {
	let currentIndex = array.length;
	
	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
}

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

Template('stimuli.csv', currentrow => {
	// randomize the order of the mc answers
	let answers = [
		currentrow.first_answer, currentrow.second_answer, 
		currentrow.third_answer, currentrow.fourth_answer
	];
	
	shuffle(answers);
	
	let mc_question = `
		<form id="sectionForm" method="post">
			<input name="mc_answer_${answers[0]}" type="checkbox" id="${answers[0]}" value="${answers[0]}"><label for="${answers[0]}">${answers[0]}</label><br><br>
			<input name="mc_answer_${answers[1]}" type="checkbox" id="${answers[1]}" value="${answers[1]}"><label for="${answers[1]}">${answers[1]}</label><br><br>
			<input name="mc_answer_${answers[2]}" type="checkbox" id="${answers[2]}" value="${answers[2]}"><label for="${answers[2]}">${answers[2]}</label><br><br>
			<input name="mc_answer_${answers[3]}" type="checkbox" id="${answers[3]}" value="${answers[3]}"><label for="${answers[3]}">${answers[3]}</label>
		</form>
	`
	return newTrial(
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
		
		newText(
			"incorrect", 
			"That's not the correct answer. Please try again."
		)
			.css('color', 'rgb(188, 74, 60)')
			.center()
		,
		
		newTextInput('distractor_response')
			.css(centered_justified_style)
			.lines(1)
			.print()
			.wait(
				getTextInput('distractor_response')
					.test.text(RegExp('^' + currentrow.distractor_answer + '$', 'i'))
					.success(
						getText('incorrect')
							.remove()
					)
					.failure(
						getText('incorrect')
							.print()
					)
			)
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
		
		newVar('RT_mc')
			.global()
			.set(v => Date.now())
		,
		
		newText('mc_prompt', currentrow.mc_prompt)
			.css(centered_justified_style)
			.print()
		,
		
		newHtml('mc_question', mc_question +
			`<script>
				(function() {
				    const form = document.querySelector('#sectionForm');
				    const checkboxes = form.querySelectorAll('input[type=checkbox]');
				    const checkboxLength = checkboxes.length;
				    const firstCheckbox = checkboxLength > 0 ? checkboxes[0] : null;

				    function init() {
				        if (firstCheckbox) {
				            for (let i = 0; i < checkboxLength; i++) {
				                checkboxes[i].addEventListener('change', checkValidity);
				            }

				            checkValidity();
				        }
				    }

				    function isChecked(n) {
						let n_checked = 0;
				        for (let i = 0; i < checkboxLength; i++) {
				            if (checkboxes[i].checked) n_checked++;
				        }
						
						if (n_checked >= n) return true;
						
				        return false;
				    }

				    function checkValidity() {
				        const errorMessage = !isChecked(3) ? 'At least three checkboxes must be selected.' : '';
				        firstCheckbox.setCustomValidity(errorMessage);
				    }

				    init();
				})();
				</script>
			`
		)
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
		,
		
		getVar('RT_mc')
			.set(v => Date.now() - v)
	)
		.log('item',			         currentrow.item)
		.log('sentence',		         currentrow.sentence)
		.log('condition',		         currentrow.condition)
		.log('distractor_question',      currentrow.distractor_question)
		.log('group',                    currentrow.group)
		.log('correct_answers',          currentrow.correct_answers)
		.log('reading_time_sentence',    getVar('RT_sentence'))
		.log('response_time_distractor', getVar('RT_distractor'))
		.log('response_time_mc',         getVar('RT_mc'))
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