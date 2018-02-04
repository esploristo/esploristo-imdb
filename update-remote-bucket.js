'use strict';
let updateRemoteBucket = function () {
	let aws = require('aws-sdk');
	let config = require('./config');
	let date = config.date;
	console.log(`Start update remote on aws s3 bucket for ${date}`);
	let filenames = [
		'name.basics.tsv.gz'
		'title.basics.tsv.gz',
		'title.crew.tsv.gz',
		'title.episode.tsv.gz',
		'title.principals.tsv.gz',
		'title.ratings.tsv.gz'
	];
	let srcBucketName = 'imdb-datasets';
	let srcKeyPrefix = 'documents/v1/' + date + '/'; 
	let desBucketName = config.bucketName;
	let akid = config.accesKeyId;
	let secret = config.secret;
	let credentials = new aws.Credentials(akid, secret, null);
	let s3 = new aws.S3({
		credentials: credentials,
		endpoint: 's3.'+config.region+'.amazonaws.com',
		region: config.region,
	});
	filenames.forEach(function(filename) {
		let srcKey = srcKeyPrefix + filename;
		let desKey = srcKey;
		let params = {
			Bucket: desBucketName,
			Key: desKey,
			CopySource: srcBucketName + '/' + srcKey,
			RequestPayer: 'requester',
		};
		s3.copyObject(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				console.log('Errors for ' + srcKey);
			}
			else {
				console.log(data);
				console.log('Update successful for ' + srcKey);
			}
		});
	});
};
module.exports = updateRemoteBucket;
