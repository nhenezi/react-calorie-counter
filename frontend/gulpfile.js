var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var concat = require('concat');

gulp.task('browserify', function() {
  var bundler = browserify({
    entries: ['./src/js/index.jsx'],
    transform: [reactify],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  });

  var watcher = watchify(bundler);

  return watcher.on('update', function() {
    var updateStart = Date.now();
    console.log('Updating!');
    watcher.bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./build/js'));
    console.log('Updated', (Date.now() - updateStart) + 'ms');
  })
  .bundle()
  .pipe(source('main.js'))
  .pipe(gulp.dest('./build/js'));
});

gulp.task('css', function () {
  gulp.src('./static/css/*.css')
    .pipe(gulp.dest('./build/css/'));
});

gulp.task('moment.js', function() {
  gulp.src('./bower_components/momentjs/moment.js')
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('jquery', function() {
  gulp.src('./bower_components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('react', function() {
  gulp.src('./bower_components/react/react.js')
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('react-router', function() {
  gulp.src('./bower_components/react-router/build/global/ReactRouter.js')
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('underscore', function() {
  gulp.src('./bower_components/underscore/underscore.js')
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('bootstrap', function() {
  gulp.src('./bower_components/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest('./build/css/'));
  gulp.src('./bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff')
    .pipe(gulp.dest('./build/fonts'));
  gulp.src('./bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff2')
    .pipe(gulp.dest('./build/fonts'));
  gulp.src('./bower_components/bootstrap/fonts/glyphicons-halflings-regular.ttf')
    .pipe(gulp.dest('./build/fonts'));

});

gulp.task('font-awesome', function() {
  gulp.src('./bower_components/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest('./build/css/'));

  gulp.src('./bower_components/font-awesome/fonts/fontawesome-webfont.woff')
    .pipe(gulp.dest('./build/fonts'));
  gulp.src('./bower_components/font-awesome/fonts/fontawesome-webfont.woff2')
    .pipe(gulp.dest('./build/fonts'));
  gulp.src('./bower_components/font-awesome/fonts/fontawesome-webfont.ttf')
    .pipe(gulp.dest('./build/fonts'));
});


gulp.task('html', function() {
  gulp.src('./static/html/*.html')
    .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['browserify', 'moment.js', 'jquery', 'react', 'font-awesome',
          'react-router', 'underscore', 'bootstrap', 'css', 'html']);
