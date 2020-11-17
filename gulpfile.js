const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsUiProject = ts.createProject('tsConfigFront/tsconfig.json');
const tsBackgroundProject = ts.createProject('tsConfigBack/tsconfig.json');
const less = require('gulp-less');
const pug = require('gulp-pug');
const removeCode = require('gulp-remove-code');
const strip = require('gulp-strip-comments');

gulp.task('pug-process-popup', () => {
    return gulp
        .src('src/pug/popup.pug')
        .pipe(
            pug({
                pretty: true,
            })
        )
        .pipe(gulp.dest('dist/'));
});

gulp.task('pug-process-background', () => {
    return gulp
        .src('./src/pug/background.pug')
        .pipe(
            pug({
                pretty: true,
            })
        )
        .pipe(gulp.dest('dist/'));
});

gulp.task('less', () => {
    return gulp.src('src/less/style.less').pipe(less({})).pipe(gulp.dest('dist/css'));
});

gulp.task('img', () => {
    return gulp.src('src/img/*.*').pipe(gulp.dest('dist/img'));
});

gulp.task('locales', () => {
    return gulp.src('src/_locales/*/*.*').pipe(gulp.dest('dist/_locales'));
});

gulp.task('manifest', () => {
    return gulp.src('src/manifest.json').pipe(gulp.dest('dist/'));
});

gulp.task('ts-process-popup', () => {
    return tsUiProject.src().pipe(tsUiProject()).js.pipe(gulp.dest('src/temp/cleanExportRow'));
});

gulp.task('ts-process-background', function () {
    return tsBackgroundProject.src().pipe(tsBackgroundProject()).js.pipe(gulp.dest('src/temp/cleanExportRow'));
});

gulp.task('removeCodeComments', function () {
    return gulp
        .src('src/temp/cleanExportRow/*.js')
        .pipe(removeCode({ production: true }))
        .pipe(gulp.dest('src/temp/cleanOtherComments'));
});

gulp.task('removeOtherComments', function () {
    return gulp.src('src/temp/cleanOtherComments/*.js').pipe(strip()).pipe(gulp.dest('dist/js'));
});

gulp.task('watch', () => {
    gulp.watch('src/pug/**/*.pug', gulp.series('pug-process-popup'));
    gulp.watch('src/pug/**/*.pug', gulp.series('pug-process-background'));
    gulp.watch('src/less/**/*.less', gulp.series('less'));
    gulp.watch('src/less/*.less', gulp.series('less'));
    gulp.watch('src/img/**/*.*', gulp.series('img'));
    gulp.watch('src/_locales/**/*.*', gulp.series('locales'));
    gulp.watch('src/manifest.json', gulp.series('manifest'));
    gulp.watch('src/ts/**/*.ts', gulp.series('ts-process-popup'));
    gulp.watch('src/ts/**/*.ts', gulp.series('ts-process-background'));
    gulp.watch('src/temp/cleanExportRow/*.js', gulp.series('removeCodeComments'));
    gulp.watch('src/temp/cleanOtherComments/*.js', gulp.series('removeOtherComments'));

});

gulp.task(
    'default',
    gulp.series(
        gulp.parallel('pug-process-popup', 'pug-process-background', 'less', 'img', 'locales', 'manifest', 'ts-process-popup', 'ts-process-background'),
        gulp.task("removeCodeComments"),
        gulp.task("removeOtherComments"),
        gulp.parallel('watch')
    )
);
