# Sincronização de Estado em Formulários Next.js

## 📌O Problema (The bug)
Havia um bug crítico de sincronização onde as validações de formulário executadas no componente pai não refletiam visualmente no componente filho.

**Causa Raiz:** Violação do princípio de Single Source of Truth (Fonte Única de Verdade). O componente filho estava duplicando o estado internamente com um useState próprio, isolando-se do fluxo de dados do pai. Como resultado, o usuário digitava um e-mail inválido, o pai detectava o erro, mas o filho não renderizava o alerta visual.

## ⚡A Solução: Componente Controlado
Refatorei a estrutura do formulário eliminando o estado local do componente filho, transformando-o em um **Componente Controlado** (ou Presentational Component).

* _Componente Pai (FormularioPai.tsx):_ Centraliza 100% do estado do formulário (email) e da validação (erro). É o único responsável por ditar as regras de negócio.

* _Componente Filho (InputFilho.tsx):_ Tornou-se um componente "burro" e puramente visual. Ele consome os dados estritamente via props (value, error) e notifica o pai a cada mudança através do callback onChange.

**Resultado:** Formulário 100% consistente, zero bugs de renderização, além de melhora imediata na experiência do usuário (UX) com feedback de validação em tempo real.

**Resultado visual da validação:**
![Interface do formulário mostrando erro de validação em tempo real](../../docs\prints\controlled-form\exemplo-formulario.png)

## 🛠️ Stack Envolvida

* _React.js_ (Hooks e Gerenciamento de Estado)

* _Next.js_ (App Router com diretiva 'use client')

* _TypeScript_ (Tipagem estrita das Props)

## 🚀 Como rodar
Certifique-se de navegar até a pasta deste exemplo específico para instalar as dependências corretamente:

# 1. Navegue até o diretório do desafio
```bash
cd examples/controlled-form
```
# 2. Instale as dependências do projeto
```bash
npm install
```

# 3. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Abra http://localhost:3000 no seu navegador para ver o formulário em ação. Digite um e-mail sem o caractere @ para testar a validação em tempo real sendo disparada pelo pai e refletida no filho.