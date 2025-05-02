library(tidyverse)
library(data.table)

# User-defined function to read in PCIbex Farm results files
read.pcibex <- function(
	filepath, 
	colnames.from,
	auto.colnames = TRUE, 
	fun.col = \(col, cols) {
			cols[cols == col] <- paste(col, 'Ibex', sep = '.')
			return (cols)
		}
	) {
	
	get.colnames <- function(filepath) {
		cols <- c()
		con <- file(filepath, 'r')
		while (TRUE) {
			line <- readLines(con, n = 1, warn = FALSE)
			if (length(line) == 0) {
				break
			}
			
			m <- regmatches(line, regexec(r'(^# (\d+)\. (.+)\.,*?$)', line))[[1]]
			if (length(m) == 3) {
				index <- as.numeric(m[2])
				value <- m[3]
				if (is.function(fun.col)) {
					cols <- fun.col(value, cols)
				}
				cols[index] <- value
				if (index == n.cols) {
					break
				}
			}
		}
		close(con)
		
		return (cols)
	}
	
	n.cols <- max(count.fields(filepath, sep = ',', quote = NULL), na.rm = TRUE)
	if (auto.colnames) {
		cols <- get.colnames(filepath)
		
		# this happens due to a data coding errors we've fixed
		if (is.null(cols)) {
			cols <- get.colnames(colnames.from)
		}
		
		return (read.csv(filepath, comment.char = '#', header = FALSE, col.names = cols, fileEncoding = 'UTF-8'))
	}
	else {
		return (read.csv(filepath, comment.char = '#', header = FALSE, col.names = seq_len(n.cols), fileEncoding = 'UTF-8'))
	}
}

df <- read.pcibex('results_prod.csv') |>
	as_tibble() |>
	mutate(
		participant = paste0(Results.reception.time, MD5.hash.of.participant.s.IP.address),
		participant = match(participant, unique(participant))
	) |>
	select(-Results.reception.time, -MD5.hash.of.participant.s.IP.address) |>
	select(participant, everything())

df <- df |>
	filter(PennElementName == 'mc_question') |>
	select(
		participant, group,
		Parameter, Value, item:distractor_question,
		correct_answers:response_time_mc
	) |>
	rename(response = Value) |>
	mutate(
		item = as.numeric(item),
		response = case_when(
			response == 'checked' ~ Parameter |> 
				str_replace_all('mc_answer_(.*?)$', '\\1') |>
				trimws(),
			TRUE ~ NA_character_
		),
		distractor_question = distractor_question |>
			trimws(),
		sentence = sentence |>
			str_replace_all('%2C', ',') |>
			trimws(),
		correct_answers = correct_answers |>
			trimws() |>
			str_replace_all('%2C', ',') |>
			str_replace_all(', ', ',')
	) |>
	select(-Parameter) |>
	group_by(
		participant, group, item, sentence, condition, 
		distractor_question, correct_answers, reading_time_sentence,
		response_time_distractor, response_time_mc
	) |>
	summarize(response = paste0(response[!is.na(response)], collapse = ',')) |>
	ungroup() |>
	mutate(
		response_accuracy = mapply(
			\(ca, r) {
				as.numeric(
					all(sort(str_split_1(ca, ',')) == sort(str_split_1(r, ',')))
				)
			},
			correct_answers, response
		)
	) |> 
	select(
		participant, group, item, condition, sentence, 
		reading_time_sentence, distractor_question, 
		response_time_distractor, correct_answers, 
		response, response_accuracy, response_time_mc
	)

df |>
	write.csv('cleaned_results.csv', row.names = FALSE)