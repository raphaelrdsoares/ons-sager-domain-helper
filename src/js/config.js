app.config(function($routeProvider) {
	$routeProvider
		.when("/import", { templateUrl: "import.html", controller: "ImportController" })
		.when("/manipulate", { templateUrl: "manipulate.html", controller: "DomainController" })
		.otherwise({ redirectTo: "/manipulate" });
});
