'use strict';

const fs = require('fs');
const config = require('./config');
const chalk = require('chalk');
const exec = require('child_process').exec;
const LineByLineReader = require('line-by-line');

const date = config.date;
const folderPath = `/home/user/esploristo-imdb/data/imdb/documents/v1/${date}`;
const fileName = `${folderPath}/title.basics.tsv`;
const movieTsvFile = `${folderPath}/movie.tsv`;
const genreTsvFile = `${folderPath}/genre.tsv`;
const movieGenreTsvFile = `${folderPath}/movie-genre.tsv`;
const types = config.types;
const genres = config.genres;
// const genresStrById = config.genresStrById;
const genresStrUpById = config.genresStrUpById;
const separator = '\t';
const s = separator;
const warningEnabled = false;
const testEnabled = false;
const headers = {
	movie: 'imdb_id\ttype\toriginal_title\tprimary_title\tstart_year\tend_year\truntime\tgenres',
	genre: 'id\tid_str\tid_str_up',
	movieGenre: 'movie_imdb_id\tgenre_id'
};

const logError = function(message, line) {
	console.error(chalk.red(`Line ${line} : ${message}`));
};
const logWarning = function(message, line) {
	if(warningEnabled) {
		console.warn(chalk.yellow(`Line ${line} : ${message}`));
	}
};

const generateTsv = function () {
	if(fs.existsSync(movieTsvFile)) {
		fs.unlink(movieTsvFile, function(error) {
			if(error) {
				logError(error);
			} else {
				generateTsv2();
			}
		});
	} else {
		generateTsv2();
	}
};

const generateTsv2 = function () {
	if(fs.existsSync(movieGenreTsvFile)) {
		fs.unlink(movieGenreTsvFile, function(error) {
			if(error) {
				logError(error);
			} else {
				generateTsv3();
			}
		});
	} else {
		generateTsv3();
	}
};

const generateTsv3 = function() {
	exec(`wc -l ${fileName}`, function (error, results) {
		if(error) {
			return logError(error);
		} else {
			generateTsv4(parseInt(results));
		}
	});
};

const generateTsv4 = function (linesCount) {
	writeGenreTsvFile();
	let stream = fs.createWriteStream(movieTsvFile, {flags:'a'});
	let streamMovieGenre = fs.createWriteStream(movieGenreTsvFile, {flags:'a'});
	stream.write(`${headers.movie}\n`);
	streamMovieGenre.write(`${headers.movieGenre}\n`);
	let i = 0;
	let lr = new LineByLineReader(fileName);
	lr.on('line', function (line) {
		i++;
		if(! (i % parseInt(linesCount / 100))) {
			let r = parseInt(i / linesCount * 100);
			console.log(`${r}%`);
		}
		if(testEnabled && i > 1000) return;
		let elements = line.split('\t');
		if(elements[0].length !== 9) {
			logError('Imdb id should be 9 chars long', i);
			return;
		}
		let imdbId = elements[0] || null;
		let type = null;
		if(types.includes(elements[1])) {
			type = elements[1];
		} else {
			logError(`Type should be ${types}. Instead found ${elements[1]}`, i);
			return;
		}
		let originalTitle = elements[3] || null;
		let primaryTitle = elements[2] || null;
		let startYear = parseInt(elements[5]) || null;
		let endYear = parseInt(elements[6]) || null;
		let runtime = parseInt(elements[7]) || null;
		let lineGenres = elements[8] || null;
		lineGenres = lineGenres.split(',');
		lineGenres = lineGenres.filter(function(genreStrUp) {
			if(genreStrUp === '\\N') {
				logWarning('No genre', i);
				return false;
			}
			let b = genresStrUpById.includes(genreStrUp);
			if(!b) {
				logError(`Genre should not be ${genreStrUp}`, i);
			}
			return b;
		});
		lineGenres.forEach(function(genreStrUp) {
			streamMovieGenre.write(`${imdbId}${s}${genres[genreStrUp].id}\n`);
		});
		lineGenres = lineGenres.length ? lineGenres : null;
		line = `${imdbId}${s}${type}${s}${originalTitle}${s}${primaryTitle}${s}${startYear}${s}${endYear}${s}${runtime}${s}${lineGenres}`;
		stream.write(line + '\n');
	});
	lr.on('end', function () {
		console.log('100%');
		exec(`wc -l ${fileName}`, function (error, results) {
			if(error) {
				return logError(error);
			} else {
				console.log(`File in :\n${results}`);
				exec(`wc -l ${genreTsvFile} ${movieTsvFile} ${movieGenreTsvFile}`, function (error, results) {
					if(error) {
						return logError(error);
					} else {
						console.log(`Files out :\n${results}`);
					}
				});
			}
		});
	});
};

const writeGenreTsvFile = function() {
	if(fs.existsSync(genreTsvFile)) {
		fs.unlink(genreTsvFile, function(error) {
			if(error) {
				logError(error);
			} else {
				writeGenreTsvFile2();
			}
		});
	} else {
		writeGenreTsvFile2();
	}
};

const writeGenreTsvFile2 = function() {
	let stream = fs.createWriteStream(genreTsvFile, {flags:'a'});
	stream.write(`${headers.genre}\n`);
	config.genres.forEach(function(genre) {
		stream.write(`${genre.id}${s}${genre.idStr}${s}${genre.idStrUp}\n`);
	});
};

module.exports = generateTsv;
