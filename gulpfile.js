const gulp = require('gulp');
const gulpif = require('gulp-if');
const less = require('gulp-less');
const rename = require('gulp-rename');
const del = require('del');

const srcPath = './src/**';
const buildPath = './build/';

// 编译wxml文件
const wxmlFiles = [`${srcPath}/*.wxml`];
const wxml = () => {
  return gulp.src(wxmlFiles, { since: gulp.lastRun(wxml) })
    .pipe(gulp.dest(buildPath));
};

// 编译less、sass、wxss文件
const lessFiles = [
  `${srcPath}/*.less`,
  `${srcPath}/*.wxss`
];
const isLess = () => {
  return file.extname == '.less';
};
const wxss = () => {
  return gulp.src(lessFiles, { since: gulp.lastRun(wxss) })
    .pipe(gulpif(isLess, less()))
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest(buildPath));
};

// 编译js文件
const jsFiles = [`${srcPath}/*.js`];
const js = () => {
  return gulp.src(jsFiles, { since: gulp.lastRun(js) })
    .pipe(gulp.dest(buildPath));
}

// 编译json文件
const jsonFiles = [`${srcPath}/*.json`];
const json = () => {
  return gulp.src(jsonFiles, { since: gulp.lastRun(json) })
    .pipe(gulp.dest(buildPath));
}

// 编译图片
const imgFiles = [
  `${srcPath}/*.{jpg, png, gif, ico}`
];
const img = () => {
  return gulp.src(imgFiles, { since: gulp.lastRun(img) })
    .pipe(gulp.dest(buildPath))
}

// 清除build目录下的所有文件
gulp.task('clean', () => {
  del.sync(['build/**/*']);
  done();
});

// 监听文件
gulp.task('watch', () => {
  gulp.watch(wxmlFiles, wxml);
  gulp.watch([...lessFiles], wxss);
  gulp.watch(jsFiles, js);
  gulp.watch(jsonFiles, json);
  gulp.watch(imgFiles, img);
});

// develop环境
gulp.task('dev', 
  gulp.series(
    'clean',
    gulp.parallel('wxml', 'wxss', 'js', 'json', 'img'),
    'watch'
  )
)

// test环境
gulp.task('test', 
  gulp.series(
    'clean',
    gulp.parallel('wxml', 'wxss', 'js', 'json', 'img'),
    'watch'
  )
)

// production环境
gulp.task('test',
  gulp.series(
    'clean',
    gulp.parallel('wxml', 'wxss', 'js', 'json', 'img'),
    'watch'
  )
)
