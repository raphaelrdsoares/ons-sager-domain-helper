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

var app = angular.module("app", ["cgNotify", "ngRoute"]);
