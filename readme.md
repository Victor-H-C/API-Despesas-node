# Despesas

## Requisitos

1. node (versão mais recente de LTS)
2. Executar npm i para baixar dependências
3. MySQL
4. Definir parametros do arquivo DB.js
5. Executar no banco o arquivo DB.sql
6. Alterar o caminho do fetch na home.html

* /despesas [GET] -> retorna lista de despesas do mês atual
* /despesas/{Id} [GET] -> retorna despesa específica
* /despesas/categoria [GET] -> retorna lista de categorias
* /despesas/categoria [POST] -> cadastrar categoria
* params:
        * nome
        * descricao
* /despesas/categoria [DELETE] -> exclui categoria
    * params:
        * id
* /despesas/tipo [GET] -> retorna lista de tipos

* /despesas [POST] -> insere uma despesa
    * params:
        * valor
        * data
        * idcategorias
        * idtipopagamento
        * cep
* /despesas [DELETE] -> exclui despesa
    * params:
        * id

* /despesas [PATCH][PUT] -> atualiza despesa
* params:
        * valor
        * data
        * idcategorias
        * idtipopagamento
        * cep
        * id
