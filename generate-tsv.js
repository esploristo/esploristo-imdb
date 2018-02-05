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
const types = config.types;
const genres = config.genres;
const separator = '\t';
const s = separator;
const testEnabled = false;

const logError = function(message, line) {
	console.error(chalk.red(`Line ${line} : ${message}`));
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

const generateTsv2 = function() {
	exec(`wc -l ${fileName}`, function (error, results) {
		if(error) {
			return logError(error);
		} else {
			generateTsv3(parseInt(results));
		}
	});
};

const generateTsv3 = function (linesCount) {
	let stream = fs.createWriteStream(movieTsvFile, {flags:'a'});
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
		lineGenres = lineGenres.filter(function(genre) {
			if(genre === '\\N') {
				return false;
			}
			let b = genres.includes(genre);
			if(!b) {
				logError(`Genre should not be ${genre}`, i);
			}
			return b;
		});
		lineGenres = lineGenres.length ? lineGenres : null;
		line = `${imdbId}${s}${type}${s}${originalTitle}${s}${primaryTitle}${s}${startYear}${s}${endYear}${s}${runtime}${s}${lineGenres}`;
		stream.write(line + '\n');
	});
	lr.on('end', function () {
		console.log('100%');
	});
};

module.exports = generateTsv;
