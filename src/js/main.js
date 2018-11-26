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
//OK: Opção de salvar a URL (com um alias) + exibir os alias das URLs salvar em cima pra facilitar. Ao clicar no link do alias, carregar a URL no input e já realizar a busca
//OK: Exibir mensagem de erro para instalar a extensão CORS caso não consiga realizar a busca
//OK: Exibir mensagem de erro caso a URL da busca esteja incorreta
//OK: Trocar os campos de input de string pra Object. Ex: field_mainUrl = {value: "", errorMsg: ""}; Caso o errorMsg seja esteja preenchido, exibir o conteúdo da mensagem de erro abaixo do campo e colocar o campo com estilo vermelho
//OK: Exibir msg de campos obrigatórios ao pesquisar e ao salvar a URL;
//OK: Colocar tela de carregamente

//TODO: Copiar todas as alterações efetuadas para o starter-template também

//ToDo: Prover alguma forma de editar em lote;
//TODO: Opção de buscar por todos os tipos. Ao exibir os registros, caso sejam de tipos diferentes, exibir o tipo junto com o id. Lembrar de verificar a url de persistência.
//TODO: Converter algumas funcionalidades em Serviços e/ou subcontrollers

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
		$scope.field_mainUrl = {
			value: "",
			errorMsg: ""
		};
		$scope.field_aliasUrl = {
			value: "",
			errorMsg: ""
		};
		$scope.persistURL = "";
		$scope.records = undefined;
		$scope.recordIdToManipulate = "";
		$scope.urls = [];
		$scope.errorCode = undefined;
		$scope.showLoadingScreen = false;
		$scope.isCollapsed = true;

		function init() {
			refreshURLs();
		}
		init();

		//#region CRUD de URL
		$scope.onSaveURL = function() {
			$scope.field_aliasUrl.errorMsg = "";
			$scope.field_mainUrl.errorMsg = "";
			var isFormValid = true;

			if ($scope.field_aliasUrl.value.trim().length === 0) {
				$scope.field_aliasUrl.errorMsg = "Este campo é obrigatório.";
				isFormValid = false;
			}
			if ($scope.field_mainUrl.value.trim().length <= 0) {
				$scope.field_mainUrl.errorMsg = "Este campo é obrigatório.";
				isFormValid = false;
			}
			if (!isFormValid) return;

			$scope.showLoadingScreen = true;
			var obj = {
				alias: $scope.field_aliasUrl.value,
				url: $scope.field_mainUrl.value
			};
			db.urls.add(obj).then(function(id) {
				$("#div_saveURL").collapse("hide");
				$scope.field_aliasUrl.value = "";
				notifySuccess("URL salva com sucesso!");
				refreshURLs();
				$scope.showLoadingScreen = false;
			});
		};

		$scope.onDeleteURL = function(id) {
			db.urls
				.where("id")
				.equals(id)
				.delete();
			refreshURLs();
		};

		$scope.onSelectURL = function(id) {
			$scope.showLoadingScreen = true;
			var selectedURL = undefined;
			$scope.urls.forEach(element => {
				if (element.id === id) selectedURL = element;
			});
			if (selectedURL) {
				$scope.field_mainUrl.value = selectedURL.url;
				$scope.onSubmitSearch();
			}
		};

		function refreshURLs() {
			$scope.urls = [];

			db.urls
				.toCollection()
				.sortBy("alias")
				.then(data => {
					$scope.urls = data;
					$scope.$apply();
				});
		}
		//#endregion

		//#region CRUD dos registros genericos
		$scope.onSubmitSearch = function() {
			$scope.field_mainUrl.errorMsg = "";
			if ($scope.field_mainUrl.value.trim().length <= 0) {
				$scope.field_mainUrl.errorMsg = "Este campo é obrigatório.";
				return;
			}
			$scope.showLoadingScreen = true;
			refreshSearch();
		};

		$scope.onShowDeleteModal = function(id) {
			$scope.recordIdToManipulate = id;
		};

		$scope.onDelete = function(id) {
			$(".modal").modal("hide");
			$scope.showLoadingScreen = true;
			var recordToDelete = undefined;
			$scope.records.forEach(element => {
				if (element.id === id) recordToDelete = element;
			});
			if (recordToDelete) deleteRecords([recordToDelete]);
		};

		$scope.onDeleteAll = function() {
			$(".modal").modal("hide");
			$scope.showLoadingScreen = true;
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
			$scope.showLoadingScreen = true;
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
			$scope.showLoadingScreen = true;
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
			$scope.showLoadingScreen = true;
			var obj = JSON.parse($("#txtArea_cloneRecord").val());
			$scope.records.forEach(element => {
				if (element.id === $scope.recordIdToManipulate) {
					obj["_metadata"] = element._metadata;

					insertRecord(obj);
				}
			});
		};

		$scope.onCollapseAllRecordData = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
			$(".div_recordData").collapse($scope.isCollapsed ? "hide" : "show");
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
				$scope.showLoadingScreen = false;
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
				$scope.showLoadingScreen = false;
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
				$scope.showLoadingScreen = false;
			});
		}

		function refreshSearch() {
			$scope.errorCode = undefined;
			$http.get($scope.field_mainUrl.value).then(
				function(response) {
					$scope.records = response.data;
					$scope.persistURL =
						$scope.field_mainUrl.value.substr(0, $scope.field_mainUrl.value.lastIndexOf("/")) + "/persist";
					if ($scope.records.length === 0) {
						notifyInfo("Não foi encontrado nenhum registro.");
					}
					console.log($scope.records);
					$scope.showLoadingScreen = false;
					$scope.isCollapsed = true;
				},
				function(responseError) {
					console.log(responseError);
					$scope.errorCode = responseError.status;
					$scope.showLoadingScreen = false;
				}
			);
		}
		//#endregion

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
