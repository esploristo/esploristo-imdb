'use strict';
const fs = require('fs');

const downloadBucket = function() {
	const aws = require('aws-sdk');
	const config = require('./config');
	const gunzip = require('gunzip-file');
	console.log('Start download of imdb data to local machine');
	let filenames = [
		'name.basics.tsv.gz',
		'title.basics.tsv.gz',
		'title.crew.tsv.gz',
		'title.episode.tsv.gz',
		'title.principals.tsv.gz',
		'title.ratings.tsv.gz'
	];
	let date = config.date;
	let keyPrefix = 'documents/v1/'+date+'/';
	let bucketName = config.bucketName;
	let akid = config.accesKeyId;
	let secret = config.secret;
	let credentials = new aws.Credentials(akid, secret, null);
	let s3 = new aws.S3({
		credentials: credentials,
		endpoint: 's3.' + config.region + '.amazonaws.com',
		region: config.region,
	});
	filenames.forEach(function(filename) {
		let key = keyPrefix + filename;
		let params = {
			Bucket: bucketName,
			Key: key,
		};
		s3.getObject(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				console.log('Errors for ' + key);
			}
			else {
				let filePath = './data/imdb/' + key;
				ensureDirectoryExistence(filePath);
				fs.writeFile(filePath, data.Body, function(err) {
					if(err) {
						console.log(err);
					} else {
						console.log('Unzipping '+filename);
						gunzip(filePath, filePath.slice(0, -3), () => {
							console.log(filename.slice(0, -3) + ' ready');
						});
					}
				});
			}
		});
	});
};

function ensureDirectoryExistence(filePath) {
	const path = require('path');
	let dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

module.exports = downloadBucket;
