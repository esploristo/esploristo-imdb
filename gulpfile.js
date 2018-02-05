const gulp = require('gulp');
const eslint = require('gulp-eslint');
const updateRemoteBucket = require('./update-remote-bucket');
const downloadBucket = require('./download-bucket');
const generateTsv = require('./generate-tsv');

gulp.task('download-bucket', function() {
	downloadBucket();
});

gulp.task('generate-tsv', function() {
	generateTsv();
});

gulp.task('lint', function() {
	const files = [
		'./**/*.js',
		'.eslintrc.js'
	];
	var options = {
		rules: {
			'complexity': [1, 10],
			'max-statements': [1, 30]
		}
	};
	return gulp.src(files)
		.pipe(eslint(options))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('update-remote', function() {
	updateRemoteBucket();
});
