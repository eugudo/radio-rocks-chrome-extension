const gulp = require('gulp');
const ts = require('gulp-typescript');
const pug = require('gulp-pug');
const less = require('gulp-less');
const tsConfig = ts.createProject('tsconfig.json');


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


gulp.task('ts', function () {
    return tsConfig.src().pipe(tsConfig()).js.pipe(gulp.dest('dist/js'));
});

gulp.task('watch', () => {
    gulp.watch('src/pug/**/*.pug', gulp.series('pug-process-popup'));
    gulp.watch('src/pug/**/*.pug', gulp.series('pug-process-background'));
    gulp.watch('src/less/**/*.less', gulp.series('less'));
    gulp.watch('src/less/*.less', gulp.series('less'));
    gulp.watch('src/img/**/*.*', gulp.series('img'));
    gulp.watch('src/_locales/**/*.*', gulp.series('locales'));
    gulp.watch('src/manifest.json', gulp.series('manifest'));
    gulp.watch('src/ts/*.ts', gulp.series('ts'));
});

gulp.task(
    'default',
    gulp.series(
        gulp.parallel('pug-process-popup', 'pug-process-background', 'less', 'img', 'locales', 'manifest', 'ts'),
        gulp.parallel('watch')
    )
);
