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
//OK: Opção de expandar o registro pra ver seus dados
//OK: Colocar pop de confirmação na exclusão (enter pra confirmar e esc para cancelar)
//InTest: Opção de editar os dados de cada registro

//TODO: Opção de criar um clonar um registro

//TODO: Opção de salvar a URL (com um alias) + exibir os alias das URLs salvar em cima pra facilitar. Ao clicar no link do alias, carregar a URL no input e já realizar a busca
//TODO: Opção de buscar por todos os tipos. Ao exibir os registros, caso sejam de tipos diferentes, exibir o tipo junto com o id. Lembrar de verificar a url de persistência.
//TODO: Subir a pasta /dist para o git e testar a execução usando apenas esta pasta num folder separado (desconfio que o font awesome não vai funcionar. Ajustar o build pra trazer o font awesome também)

angular.module("app", []).controller("DomainController", [
	"$scope",
	"$sce",
	"$http",
	function($scope, $sce, $http) {
		$scope.inpTxt_mainUrl = "http://nl4zj.mocklab.io/sager";
		$scope.persistURL = "";
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

		$scope.onTextAreaKeyDownEvent = function($event, id) {
			if ($event.ctrlKey && $event.keyCode === 13) {
				$scope.onSaveEditRecord(id);
			}
		};

		$scope.onEditRecord = function(id) {
			var recordToEdit = undefined;
			$scope.records.forEach(element => {
				if (element.id === id) {
					recordToEdit = JSON.parse(JSON.stringify(element));
					delete recordToEdit["_metadata"];
					delete recordToEdit["id"];
					delete recordToEdit["$$hashKey"];
					$("#txtArea_editRecord").val(JSON.stringify(recordToEdit, undefined, 4));
				}
			});
		};

		$scope.onSaveEditRecord = function(id) {
			$("#modal_edit").modal("hide");
			var obj = JSON.parse($("#txtArea_editRecord").val());
			$scope.records.forEach(element => {
				if (element.id === id) {
					obj["id"] = id;
					obj["_metadata"] = element._metadata;

					updateRecord(obj);
				}
			});
		};

		$scope.format = function(object) {
			var clone = JSON.parse(JSON.stringify(object));
			delete clone["_metadata"];
			return clone;
		};

		function updateRecord(record) {
			record._metadata["changeTrack"] = "update";

			$http({
				method: "POST",
				url: $scope.persistURL,
				data: [record]
			}).then(function() {
				//success
				refreshSearch();
			});
		}

		function deleteRecords(records) {
			records.forEach(element => {
				element._metadata["changeTrack"] = "destroy";
			});

			$http({
				method: "POST",
				url: $scope.persistURL,
				data: records
			}).then(function() {
				//success
				refreshSearch();
			});
		}

		function refreshSearch() {
			$http.get($scope.inpTxt_mainUrl).then(function(response) {
				$scope.records = response.data;
				$scope.persistURL =
					$scope.inpTxt_mainUrl.substr(0, $scope.inpTxt_mainUrl.lastIndexOf("/")) + "/persist";
				console.log($scope.records);
			});
		}
	}
]);
