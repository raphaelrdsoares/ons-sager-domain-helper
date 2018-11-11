/**
 * ---------------------------------------------------
 * Starter Template - Um template com estrutura inicial para um projeto básico front-end.
 *
 * @author Copyright 2018 RaphaelRDSoares <raphael@rdsoares.com>
 * @license https://en.wikipedia.org/wiki/MIT_License
 * @see https://github.com/raphaelrdsoares/starter-template
 * @version 0.1.0
 * ---------------------------------------------------
 */
angular.module("app", []).controller("DomainController", [
	"$scope",
	"$sce",
	"$http",
	function($scope, $sce, $http) {
		$scope.inpTxt_mainUrl = "";
		$scope.records = [];

		$scope.onSubmitSearch = function() {
			refreshSearch();
		};

		$scope.onDelete = function(id) {
			var recordToDelete = undefined;
			$scope.records.forEach(element => {
				if (element.id === id) recordToDelete = element;
			});
			if (recordToDelete) deleteRecords([recordToDelete]);
		};

		$scope.onDeleteAll = function() {
			deleteRecords($scope.records);
		};

		function deleteRecords(records) {
			records.forEach(element => {
				element._metadata["changeTrack"] = "destroy";
			});

			var persistURL = $scope.inpTxt_mainUrl.substr(0, $scope.inpTxt_mainUrl.lastIndexOf("/")) + "/persist";
			$http({
				method: "POST",
				url: persistURL,
				data: records
			}).then(function() {
				//success
				refreshSearch();
			});
		}

		function refreshSearch() {
			$http.get($scope.inpTxt_mainUrl).then(function(response) {
				$scope.records = response.data;
				console.log($scope.records);
			});
		}
	}
]);

// $(document).ready(function() {
// 	$("#form_searchByURL").submit(function(e) {
// 		e.preventDefault();
// 		var mainUrl = $("#inpTxt_mainUrl").val();

// 		$.get(mainUrl, function(data, textStatus, jqXHR) {
// 			console.log(data);
// 		});
// 	});
// });
