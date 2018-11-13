//Fonte: https://css-tricks.com/gulp-for-beginners/

/* ================= HOW TO ====================
Como usar:

1. Instalar o gulp globalmente e poder usar o comando 'gulp ...' via linha de comando, rodar o comando:
$ sudo npm install gulp - g

2. Executar '$ sudo npm install' pra instalar as dependências do projeto

3. Executar o comando '$ gulp start' para habilitar o live reloading (qualquer alteração é executada)

4. Executar o comando '$ gulp build' para gerar uma versão de destribuição
*/

const gulp = require("gulp");
const browserSync = require("browser-sync");
const minify = require("gulp-minify");
const cssnano = require("gulp-cssnano");
const gulpIf = require("gulp-if");
const useref = require("gulp-useref");
const del = require("del");
const runSequence = require("run-sequence");
const imagemin = require("gulp-imagemin");
const zip = require("gulp-zip");

// ================= BUILD TASKS ====================
gulp.task("clean", function() {
	return del[("dist", { force: true })];
});

gulp.task("images", function() {
	return gulp
		.src("src/**/*.+(png|jpg|gif|svg)")
		.pipe(imagemin())
		.pipe(gulp.dest("dist/"));
});

gulp.task("useref", function() {
	return gulp
		.src("src/*.html")
		.pipe(useref())
		.pipe(gulpIf("*.js", minify({ noSource: true, ext: { min: ".js" } }))) // Minifies only if it's a JavaScript file
		.pipe(gulpIf("*.css", cssnano())) // Minifies only if it's a CSS file
		.pipe(gulp.dest("dist"));
});

gulp.task("font-awesome", function() {
	//para o font-awesome
	return gulp.src("node_modules/@fortawesome/fontawesome-free/webfonts/*").pipe(gulp.dest("dist/webfonts"));
});

gulp.task("zip-dist", () =>
	gulp
		.src("dist/*")
		.pipe(zip("dist.zip"))
		.pipe(gulp.dest("dist"))
);

gulp.task("build", function(callback) {
	runSequence("clean", ["useref", "font-awesome", "images"], "zip-dist", callback);
});

// ================= DEVELOPMENT TASKS ====================
gulp.task("browserSync", function() {
	return browserSync({
		server: {
			baseDir: ["./", "./src"]
		},
		port: 8080
	});
});

gulp.task("start", ["browserSync"], function() {
	gulp.watch("src/**/*.*", browserSync.reload);
});
