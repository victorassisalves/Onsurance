# Onsurance, The insuranse evolution On Demand.

### Informações gerais ###

* **Versão atual - 2.0.0**
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)


### How do I get set up? ###

- Para testar localmente uma função use o comando:
        ```
        firebase serve --only functions:[nomeDaFuncao]
        ```
**- Para executar e deployar no firebase uma função use o comando:**
    **Cuidado, esse comando sobrescreve a função escolhida no servidor*
        ```
        firebase deploy --only functions:[nomeDaFuncao]
        ```
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Soon...
* Writing tests
* Code review
* Other guidelines

### The Hero, The Legend, The Myth... ###

- @victorassisalves
---
# Change Log 

### V. 2.0.0 Change Log

- Api de Liga / Desliga em rota do Express
- Cotação Auto e Pneus enviando email para lead
- Liga / Desliga do Produto de Pneus
- Adaptação para nova interface do Chatfuel
- Apontamento dos endpoints pro subdomínio api
- Deploy dos sites de cotação (Auto e Pneus) no subdomínio de cotacao

---

### V. 1.8.8 Change Log ###

* Adição do Express para controle de rotas e tipos de request (GET, POST, PUT, DELETE)
* Nova API de cotação. Adição de caminhonete e VUC. Atualização do multiplicador de minuto.
* Validação de acesso multitems.
* Troca de itens de vários tipos

