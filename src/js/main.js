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
//OK: Opção de editar os dados de cada registro
//OK: Opção de criar um clonar um registro
//OK: Colocar quantidade de registros ao lado do botão excluir todos
//OK: Subir a pasta /dist para o git e testar a execução usando apenas esta pasta num folder separado (desconfio que o font awesome não vai funcionar. Ajustar o build pra trazer o font awesome também)
//OK: Colocar mensagens de notificação de sucesso e erro.
//OK: Colocar mensagem quando não houver registro disponível na busca.

//TODO: Opção de salvar a URL (com um alias) + exibir os alias das URLs salvar em cima pra facilitar. Ao clicar no link do alias, carregar a URL no input e já realizar a busca
//TODO: Opção de buscar por todos os tipos. Ao exibir os registros, caso sejam de tipos diferentes, exibir o tipo junto com o id. Lembrar de verificar a url de persistência.

var db = new Dexie("ONS_SAGER_DOMAIN_HELPER");
db.version(1).stores({
	urls: "++id,alias,url"
	// ...add more stores (tables) here...
});

db.open();

angular.module("app", ["cgNotify"]).controller("DomainController", [
	"$scope",
	"$sce",
	"$http",
	"notify",
	function($scope, $sce, $http, notify) {
		$scope.inpTxt_mainUrl = "";
		$scope.inpTxt_aliasUrl = "";
		$scope.persistURL = "";
		$scope.records = undefined;
		$scope.recordIdToManipulate = "";
		$scope.urls = [];

		function init() {
			refreshURLs();
		}
		init();

		$scope.onSaveURL = function() {
			if ($scope.inpTxt_aliasUrl.length > 0) {
				var obj = {
					alias: $scope.inpTxt_aliasUrl,
					url: $scope.inpTxt_mainUrl
				};
				db.urls.add(obj).then(function(id) {
					$("#div_saveURL").collapse("hide");
					$scope.inpTxt_aliasUrl = "";
					notifySuccess("URL salva com sucesso!");
					refreshURLs();
				});
			}
		};

		$scope.onDeleteURL = function(id) {
			db.urls
				.where("id")
				.equals(id)
				.delete();
			refreshURLs();
		};

		$scope.onSelectURL = function(id) {
			var selectedURL = undefined;
			$scope.urls.forEach(element => {
				if (element.id === id) selectedURL = element;
			});
			if (selectedURL) {
				$scope.inpTxt_mainUrl = selectedURL.url;
				$scope.onSubmitSearch();
			}
		};

		function refreshURLs() {
			$scope.urls = [];
			db.urls.toCollection().each(function(element, cursor) {
				$scope.urls.push(element);
				$scope.$apply();
			});
		}

		$scope.onSubmitSearch = function() {
			if ($scope.inpTxt_mainUrl.trim().length > 0) {
				refreshSearch();
			}
		};

		$scope.onShowDeleteModal = function(id) {
			$scope.recordIdToManipulate = id;
		};

		$scope.onDelete = function(id) {
			$(".modal").modal("hide");
			var recordToDelete = undefined;
			$scope.records.forEach(element => {
				if (element.id === id) recordToDelete = element;
			});
			if (recordToDelete) deleteRecords([recordToDelete]);
		};

		$scope.onDeleteAll = function() {
			$(".modal").modal("hide");
			deleteRecords($scope.records);
		};

		$scope.onTextAreaEditKeyDownEvent = function($event, id) {
			if ($event.ctrlKey && $event.keyCode === 13) {
				$scope.onSaveEditRecord(id);
			}
		};

		$scope.onTextAreaCloneKeyDownEvent = function($event, id) {
			if ($event.ctrlKey && $event.keyCode === 13) {
				$scope.onSaveCloneRecord(id);
			}
		};

		$scope.onShowEditModal = function(id) {
			$scope.recordIdToManipulate = id;
			var recordToEdit = undefined;
			$scope.records.forEach(element => {
				if (element.id === id) {
					recordToEdit = JSON.parse(JSON.stringify(element));
					delete recordToEdit["_metadata"];
					delete recordToEdit["id"];
					delete recordToEdit["$$hashKey"];
					$(".txtArea_editRecord").val(JSON.stringify(recordToEdit, undefined, 4));
				}
			});
		};

		$scope.onSaveEditRecord = function() {
			$(".modal").modal("hide");
			var obj = JSON.parse($("#txtArea_editRecord").val());
			$scope.records.forEach(element => {
				if (element.id === $scope.recordIdToManipulate) {
					obj["id"] = $scope.recordIdToManipulate;
					obj["_metadata"] = element._metadata;

					updateRecord(obj);
				}
			});
		};

		$scope.onSaveEditAsNewRecord = function() {
			$(".modal").modal("hide");
			var obj = JSON.parse($("#txtArea_editRecord").val());
			$scope.records.forEach(element => {
				if (element.id === $scope.recordIdToManipulate) {
					obj["_metadata"] = element._metadata;

					insertRecord(obj);
				}
			});
		};

		$scope.onSaveCloneRecord = function() {
			$(".modal").modal("hide");
			var obj = JSON.parse($("#txtArea_cloneRecord").val());
			$scope.records.forEach(element => {
				if (element.id === $scope.recordIdToManipulate) {
					obj["_metadata"] = element._metadata;

					insertRecord(obj);
				}
			});
		};

		$scope.format = function(object) {
			var clone = JSON.parse(JSON.stringify(object));
			delete clone["_metadata"];
			return clone;
		};

		function insertRecord(record) {
			record._metadata["changeTrack"] = "create";

			$http({
				method: "POST",
				url: $scope.persistURL,
				data: [record]
			}).then(function() {
				//success
				refreshSearch();
				notifySuccess("Registro salvo com sucesso!");
			});
		}

		function updateRecord(record) {
			record._metadata["changeTrack"] = "update";

			$http({
				method: "POST",
				url: $scope.persistURL,
				data: [record]
			}).then(function() {
				//success
				refreshSearch();
				notifySuccess("Registro salvo com sucesso!");
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
				notifySuccess("Registro(s) excluidos com sucesso!");
			});
		}

		function refreshSearch() {
			$http.get($scope.inpTxt_mainUrl).then(function(response) {
				$scope.records = response.data;
				$scope.persistURL =
					$scope.inpTxt_mainUrl.substr(0, $scope.inpTxt_mainUrl.lastIndexOf("/")) + "/persist";
				if ($scope.records.length === 0) {
					notifyInfo("Não foi encontrado nenhum registro.");
				}
				console.log($scope.records);
			});
		}

		function notifySuccess(msg) {
			notify({
				message: msg,
				classes: "alert-success",
				templateUrl: "",
				position: "right",
				duration: 4000
			});
		}
		function notifyError(msg) {
			notify({
				message: msg,
				classes: "alert-danger",
				templateUrl: "",
				position: "right",
				duration: 5000
			});
		}
		function notifyInfo(msg) {
			notify({
				message: msg,
				classes: "alert-info",
				templateUrl: "",
				position: "right",
				duration: 4000
			});
		}
	}
]);
