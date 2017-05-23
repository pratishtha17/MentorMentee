var gulp = require("gulp");
var gulpUtil = require("gulp-util");
var htmlMin = require("gulp-htmlmin");
var cssMinify = require("gulp-clean-css");
var jsMinify = require("gulp-minify");
var less = require("gulp-less");
var imageMinify = require("gulp-smushit");
var copy = require('gulp-file-copy'),
    csso = require('gulp-csso');
// htmlmin = require('gulp-htmlmin');
//var jsHint = require("gulp-jshint");
//var cssLint = require("gulp-csslint");

gulp.task('default', ['watch'], function() {
    gulpUtil.log("Gulp Configured");
});

gulp.task('watch', function() {
    gulp.watch(['src/*.html'], ['html-minify']);
    gulp.watch(['src/less/*.less'], ['less-transpile']);
    gulp.watch(['src/css/*.css'], ['css-minify']);
    gulp.watch(['src/scripts/*.js'], ['js-minify']);
    gulp.watch(['src/img/*'], ['minify-image']);
    // gulp.watch(['src/scripts/lib/*'],['copy']);
});

gulp.task('html-minify', function() {
    return gulp.src('src/*.html').pipe(htmlMin({ collapseWhitespace: true })).pipe(gulp.dest('build/'));
});

gulp.task('css-minify', function() {
    return gulp.src('src/css/*.css').pipe(cssMinify({ compatibility: 'ie8' })).pipe(gulp.dest('build/css/'));
});

gulp.task('js-minify', function() {
    return gulp.src('src/scripts/*.js').pipe(jsMinify({
        ext: { src: '', min: '.js' },
        exclude: ['libs'],
        ignoreFiles: []
    })).pipe(gulp.dest('build/scripts/'));
});

gulp.task('less-transpile', function() {

    return gulp.src('src/less/*.less').pipe(less()).pipe(gulp.dest('src/css/'));
});

gulp.task('css-minify', function() {
    return gulp.src('src/css/*.css').pipe(csso()).pipe(gulp.dest('build/css/'));
});

gulp.task('minify-image', function() {
    return gulp.src('src/img/*').pipe(imageMinify({ verbose: true })).pipe(gulp.dest('build/img/'));
});



gulp.task('copy', function() {
    return gulp.src('src/scripts/libs/*').pipe(gulp.dest('build/scripts/libs/'));

});

// gulp.task('jsLint', function() {
//     return gulp.src('src/scripts/*.js') 
//         .pipe(jsHint())
//         .pipe(jsHint.reporter());
// }); 

gulp.task('default', ['watch'], function() {
    gulpUtil.log("Gulp Configured");
});