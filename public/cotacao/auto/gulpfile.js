const gulp = require("gulp");
const cleanCSS = require("gulp-clean-css");
const minify = require('gulp-minify');

function minifyCSS() {
  return (
    gulp
      .src("./*.css")
      .pipe(cleanCSS())
      .pipe(gulp.dest("dist"))
  );
}

function minifyJS() {
  return(
    gulp
    .src(['script.js'])
    .pipe(minify({noSource: true}))
    .pipe(gulp.dest('dist'))
  )
}

gulp.task("minify-css", minifyCSS);
gulp.task("minify-js", minifyJS);

gulp.task("watch", () => {
  gulp.watch("./*.css", minifyCSS);
  gulp.watch("./*.js", minifyJS);
});

gulp.task('default', gulp.series('minify-css', 'minify-js', 'watch'));