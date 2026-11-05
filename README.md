# Protótipo de Demonstração - App SUS

Protótipo de uma plataforma de transparência e acompanhamento de vagas e encaminhamentos do SUS, desenvolvido para a disciplina de Empreendedorismo do curso de Sistemas de Informação da UFVJM.

O projeto busca facilitar o acesso dos cidadãos às informações sobre atendimentos na rede municipal de saúde, permitindo consultar vagas disponíveis, acompanhar encaminhamentos e receber avisos sobre consultas. Para a gestão municipal, oferece ferramentas para visualizar filas de espera, monitorar a demanda e acompanhar o aproveitamento de vagas.

A aplicação é um protótipo acadêmico. Os dados apresentados são fictícios e as integrações com sistemas de regulação e canais de comunicação são simuladas.

## Funcionalidades

A aplicação está organizada em quatro áreas principais:

- Página inicial: apresentação da proposta e acesso às diferentes áreas da plataforma.
- Portal do paciente: consulta de vagas, acompanhamento de encaminhamentos, notificações e gerenciamento de familiares.
- Simulador de WhatsApp: demonstração de como os cidadãos poderiam consultar informações e interagir com os serviços de saúde por mensagens.
- Painel de gestão: visualização de indicadores, filas de espera, encaminhamentos, disponibilidade de vagas e redistribuição de vagas liberadas.

A aplicação utiliza dados de demonstração para permitir a navegação e a apresentação dos principais fluxos do sistema sem depender de serviços externos.

## Tecnologias

O projeto utiliza as seguintes tecnologias principais:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

Outras bibliotecas podem ser utilizadas para componentes de interface, ícones, gráficos e manipulação de datas.

## Requisitos

Para executar o projeto localmente, você precisa de:

- [Node.js](https://nodejs.org/), preferencialmente a versão 22 LTS.
- npm, incluído na instalação do Node.js.

O projeto utiliza Vite 8, que requer Node.js 20.19 ou superior, ou 22.12 ou superior nas versões da linha 22. Portanto, verifique a versão instalada antes de continuar.

Para conferir as versões, execute:

```bash
node -v
npm -v
```

## Instalação e execução

### 1. Obtenha o projeto

Extraia o arquivo ZIP do projeto.

Se você recebeu o projeto compactado, descompacte-o em uma pasta de fácil acesso. Em seguida, abra um terminal na pasta que contém o arquivo `package.json`.

No Windows, você pode abrir a pasta no Explorador de Arquivos, clicar na barra de endereço, digitar `cmd` e pressionar Enter.

No Linux ou macOS, abra o terminal e navegue até a pasta do projeto:

```bash
cd caminho/para/prototipo-fila-saude-publica
```

Se utilizar o Visual Studio Code, também é possível abrir a pasta do projeto e selecionar `Terminal > Novo Terminal`.

### 2. Instale as dependências

Execute o comando abaixo na raiz do projeto:

```bash
npm install
```

A instalação pode levar alguns minutos e precisa ser realizada antes da primeira execução ou quando as dependências forem alteradas.

Caso ocorram conflitos de dependências, tente:

```bash
npm install --legacy-peer-deps
```

Utilize essa alternativa apenas se a instalação convencional falhar, pois ela flexibiliza a validação das dependências entre pacotes.

O repositório também contém um arquivo de lock do Bun. Caso você já utilize esse gerenciador, pode instalar as dependências com `bun install`. Para seguir estas instruções, entretanto, o npm é suficiente.

### 3. Inicie a aplicação

Execute:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação. Normalmente, ele será:

```text
http://localhost:5173
```

Abra o endereço indicado no navegador. Caso a porta padrão esteja ocupada, o Vite poderá utilizar outra, que será informada no terminal.

Para encerrar a aplicação, pressione `Ctrl + C` no terminal em que o servidor está sendo executado.

## Navegação

As principais áreas podem ser acessadas pelas seguintes rotas:

| Rota | Descrição |
|---|---|
| `/` | Página inicial e apresentação do projeto |
| `/paciente` | Portal do paciente e do cuidador |
| `/whatsapp` | Simulador de conversa por WhatsApp |
| `/gestao` | Painel da Secretaria Municipal de Saúde |

As rotas internas de cada área permitem acessar funcionalidades específicas, como consultar vagas, acompanhar pedidos e visualizar informações sobre a gestão da fila.

## Dados de demonstração

O protótipo utiliza dados fictícios para demonstrar os fluxos da aplicação. Os nomes, documentos, telefones, protocolos, vagas, encaminhamentos e indicadores apresentados não devem ser considerados informações reais da rede pública de saúde.

As integrações com sistemas como e-SUS Regulação e SISREG, assim como os serviços de WhatsApp e SMS, são representadas de forma simulada.

A aplicação não realiza autenticação real, não se conecta aos sistemas oficiais de regulação e não deve ser utilizada para armazenar ou processar dados reais de pacientes.

Quando disponível na interface, utilize a opção de restaurar os dados de demonstração para retornar ao estado inicial da apresentação.

## Compilação para produção

Para gerar a versão de produção, execute:

```bash
npm run build
```

Os arquivos estáticos serão gerados no diretório `dist/client`.

Para publicar no GitHub Pages, execute:

```bash
npm run deploy
```

Para verificar localmente a versão compilada, execute:

```bash
npm run preview
```

Acesse o endereço informado pelo terminal seguido de `/prototipo-fila-saude-publica/`.

### Equipe

- Ana Júlia Oliveira Araújo
- Ana Clara Rolim de Azevedo
- Augusto Henrique Santos de Oliveira
- Camila Santos Barbosa
- Deivid Camargos Batista
- Filipe Hipólito Diniz Durães

Curso: Sistemas de Informação  
Instituição: UFVJM  
Disciplina: Empreendedorismo  
Professora: Cinthya Rocha Tameirão

---

Protótipo acadêmico. Todos os dados são fictícios e destinados exclusivamente à demonstração.