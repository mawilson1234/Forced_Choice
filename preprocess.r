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
		
		return (read.csv(filepath, comment.char = '#', header = FALSE, col.names = cols))
	}
	else {
		return (read.csv(filepath, comment.char = '#', header = FALSE, col.names = seq_len(n.cols)))
	}
}

df <- read.pcibex('results.csv') |>
	as_tibble() |>
	mutate(
		participant = paste0(Results.reception.time, MD5.hash.of.participant.s.IP.address),
		participant = match(participant, unique(participant))
	) |>
	select(-Results.reception.time, -MD5.hash.of.participant.s.IP.address) |>
	select(participant, everything())

demographics <- df |>
	filter(grepl('^demographics', Parameter)) |>
	select(participant, Parameter, Value) |>
	mutate(
		Parameter = gsub('^demographics_', '', Parameter),
		Value = Value |> trimws(),
		Value = gsub('%2C', ',', Value)
	) |>
	pivot_wider(
		names_from = Parameter,
		values_from = Value
	)

demographics |>
	fwrite('demographics.csv', row.names = FALSE)

df <- df |>
	filter(PennElementType == 'Selector') |>
	select(
		participant, group:third_answer_type,
		Value
	) |>
	rename(response = Value) |>
	mutate(
		sentence = gsub('%2C', ',', sentence),
		condition = condition |> trimws()
	) |>
	select(
		participant, group, item, sentence, image, condition,
		question, response, response_time, first_answer:third_answer_type
	) |>
	arrange(participant, item)

df |>
	fwrite('cleaned_results.csv', row.names = FALSE)