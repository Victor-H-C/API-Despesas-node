DROP DATABASE IF EXISTS api_rest;
CREATE DATABASE api_rest;

USE api_rest;

CREATE TABLE TB_TipoPagamento(
	IdTipoPagamento INT PRIMARY KEY AUTO_INCREMENT,
    Tipo VARCHAR(50)
);

CREATE TABLE TB_Categorias(
	IdCategorias INT PRIMARY KEY AUTO_INCREMENT,
    Nome VARCHAR(50),
    Descricao VARCHAR(50)
);

CREATE TABLE TB_Despesas(
	Id INT PRIMARY KEY AUTO_INCREMENT,
    Valor DECIMAL(10, 2),
    DataCompra DATETIME,
    IdCategorias INT,
    IdTipoPagamento INT,
    CEP VARCHAR(8),
    FOREIGN KEY (IdCategorias) REFERENCES TB_Categorias(IdCategorias),
    FOREIGN KEY (IdTipoPagamento) REFERENCES TB_TipoPagamento(IdTipoPagamento)
);

INSERT INTO TB_TipoPagamento(Tipo) VALUES('Dinheiro');
INSERT INTO TB_TipoPagamento(Tipo) VALUES('Pix');
INSERT INTO TB_TipoPagamento(Tipo) VALUES('Débito');
INSERT INTO TB_TipoPagamento(Tipo) VALUES('Crédito');