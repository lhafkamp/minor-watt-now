const gulp = require('gulp');
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const concat = require('gulp-concat');

gulp.task('sass', () => {
  return gulp.src('./src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/css'))
});

gulp.task('js', () => {
  gulp.src("./src/js/index.js")
    .pipe(browserify())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('default', ['sass', 'js'], () => {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('./src/js/**/*.js', ['js']);
})
