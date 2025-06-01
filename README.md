# Projeto EW - I am ... (in bits and bytes) - O meu eu digital
## Descrição
Este repositório foi criado para a Unidade Curricular de **Engenharia Web** (**EW**) e contém o projeto que desenvolvemos ao longo do segundo semestre do ano letivo de 2024/2025, no âmbito desta disciplina.

O projeto consistirá no desenvolvimento de uma aplicação Web, constituída por um frontend (interface
pública), backend (interface de administração e privada), persistência de dados em base de dados,
ficheiros e outros e lógica de controlo em JavaScript.

A aplicação irá suportar o "eu digital" do utilizador, ou seja, será uma espécie de diário digital. Diário digital
quer dizer que as operações sobre os dados têm uma cronologia associada e que a linha temporal será o
eixo principal da aplicação. Em termos de conteúdos, pretende-se o máximo de possibilidades como por
exemplo: fotografias, registos desportivos, crónicas, pensamentos soltos, resultados académicos,
participação em eventos, organização de eventos, opiniões, comentários sobre outros recursos Web, etc.

Para mais detalhes sobre os requisitos e objetivos do projeto, consulte o [enunciado](Enunciado.pdf).

O código desenvolvido pode ser encontrado na pasta [src](src).
## Autores
### Equipa Bugbusters 🪲🚫
- A104437 - Ana Sá Oliveira
- A104263 - Inês Silva Marques
- A76350 - José Rafael de Oliveira Vilas Boas

![BUGBUSTERS](Bugbusters.png)

# O Meu Eu Digital

O meu eu digital é uma aplicação que permite os seus utilizadores guardarem e expressarem os seus pensamentos e momentos,
um diário digital em que cada utilizador possui um espaço pessoal onde pode registar imagens, pdfs e texto.

# Utilização

### Clonar o repositório:
- Via SSH:
```
git clone git@github.com:a104437ana/EngWeb.git
```
- Ou, se preferir, via HTTPS:
```
git clone https://github.com/a104437ana/EngWeb.git
```
### Ter um docker em execução com o mongoDB na porta default (localhost:27017)
### Entrar no repositório:
```
cd EngWeb/src
```
### Abrir 3 terminais
## Terminal 1
(correr auth)
```
cd Auth
```
```
npm i
```
```
npm start
```
## Terminal 2 
(correr API de dados)
```
cd API_de_dados
```
```
npm i
```
```
npm start
```
## Terminal 3 
(correr interface)
```
cd Interface
```
```
npm i
```
```
npm start
```
### Explorar: http://localhost:3000

### Upload de uma entrada no diário:
O upload de uma nova entrada no diário tem de ser feito num formato (SIP) que definimos, exemplificado no ficheiro [SIP.zip](SIP.zip).