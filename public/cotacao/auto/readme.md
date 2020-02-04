# Onsurance Form

### Estrutura HTML

HTML dividido em 5 partes: 
- Dados do veículo
- Entendendo seu uso do onsurance
- Acessórios
- Sobre Você 
- Resultado

Foi ultilizado o [Vuejs](https://vuejs.org/) para controle do formulário, validação e envio de informações.

Vuejs da forma mais simples funciona assim:
Criar instancia do vue `new Vue()` e passar um objeto dentro com toda a lógica, ciclo de vida e métodos.

`el` (seletor): seletor para informar o container da aplicação

`data` (objeto): Dados e variáveis que podem ser usados no HTML (reativo)

`methods` (objeto): usado para eventos *onClick*, *inputs*, *validação* e etc.

(tem mais recursos do vue, mas não foi preciso pra esse projeto)

-----
`data`

> `step()` - verificação de partes do formulário (soma +1 para ir pra próxima parte)
-----

`Metodos` utilizados:

> `addAppDriver()` - adicionar apps do veículo na primeira posição do array, se o usuário escolher *outros*

> `formatPrice(value)` - Formato de preço em reais para o resultado

> `validVehicleUsage()` - limpar seleção de sub items do tipo de veículo

> `nextStep()` - verificação de validação das partes do formulário, e acionar o método `advanceStep` caso não encontre nenhum erro.

> `prevStep()` - Função de botão voltar do formulário

> `advanceStep()` - Função de botão avançar do formulário

> `send()` - funçaõ de enviar as informações da API (axios)
>
> no final manda o objeto `finalValue` com todas as informações pra retorno no axios
>
> na variável `sendSucess` eu coloquei antes da url da api um link do herokuapp por causa de problemas de cors, quando for colocar em produção. Pode remover, pq vai ficar no mesmo url.

> `validationStep()` - cada parte do formulário tem um método de valicação
> `validationStep1`, `validationStep2`, `validationStep3`, `validationStep4`.
> Separei cada parte do form em um método para cada erro de informações vir separado.
> Assim o usuário presta mais atenção no que coloca, e não só um erro genérico pra todos os campos

> `alert(mensagem)` - Função para mostrar mensagem de erro (campo vazio ou informação errada)

> `isValueNumber(event)` - validação do ano do carro

> `hoursUsedDailyVerify(event)` - validação para horas do onsurance ativo, e retirar as casas decimais

> `yearVerify()` - evento de teclado para ano do carro

---

## Como rodar o projeto

- ter instalado o `gulp`
- `npm install` (dependencias para minificar css e js)
- iniciar o projeto com algum server (usei o *liveserver* do VSCode)
- rodar `gulp` no terminal (ele vai ficar escutando as edições nos arquivos)