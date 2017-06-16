/**
 * Created by User on 12.06.2017.
 */
var gulp = require('gulp'),
    bower = require('gulp-bower'),
    notify = require("gulp-notify"),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    gulpSequence = require('gulp-sequence'),
    browserSync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    include = require("gulp-include");

   const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));


/* Compile sass */
gulp.task('styles', function () {
    return gulp.src(config.PATHS.assets + 'sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: config.PATHS.sass,
            errLogToConsole: true
        }))
        .pipe(autoprefixer({browsers: ['last 4 versions']}))
        //.pipe(gulp.dest('./dist/css'))
        .pipe(csso())
        .pipe(rename({suffix: '.min', basename: "general"}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.PATHS.dist + 'css/'))
        .pipe(notify({ message: 'Styles task complete' }))
        .pipe(browserSync.reload({stream: true}));
});

/* Scripts */
gulp.task('scripts', function() {
    return gulp.src([config.PATHS.assets +'js/*.js'])
        .pipe(include({
            extensions: "js",
            hardFail: true,
            includePaths: config.PATHS.javascript
        })).on('error', console.log)
        .pipe(concat('main.js'))
        //.pipe(gulp.dest('./prod/js/'))
        .pipe(rename({suffix: '.min', basename: "general"}))
        .pipe(uglify())
        .pipe(gulp.dest(config.PATHS.dist + 'js/'))
        .pipe(notify({ message: 'Scripts task complete' }))
        .pipe(browserSync.reload({stream: true}));
});

/* Minify image */
gulp.task('images', function() {
    gulp.src(config.PATHS.assets + 'images/*')
        .pipe(imagemin(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))))
        .pipe(gulp.dest(config.PATHS.dist +'images/'))
        .pipe(notify({ message: 'Images task complete', onLast: true }));
});

/* Fonts to Dist */

gulp.task('fonts', function() {
     gulp.src(config.PATHS.fonts)
        .pipe(gulp.dest(config.PATHS.dist+ 'fonts/'));
});

/* Clean Prod Dir */
gulp.task('clean', function() {
    return del([config.PATHS.dist + '**/*', './*.html']);
});

/* Browser synh */
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
});

/* File includes */
gulp.task('html', function() {
    gulp.src(config.PATHS.assets + '*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./'));
});

/* Build */
gulp.task('build', gulpSequence('clean', 'fonts', 'styles', 'scripts', 'images', 'html', 'browser-sync', 'watch'));


/* Watcher */

gulp.task('watch', function() {
    gulp.watch('./dev/sass/*.scss', ['styles', browserSync.reload]);
    gulp.watch('./dev/*.html', ['html']);
    gulp.watch('./dev/js/main.js', ['scripts', browserSync.reload]);
    gulp.watch('./*.html').on("change", browserSync.reload);
});