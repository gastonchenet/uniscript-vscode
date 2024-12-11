import * as vscode from "vscode";
import intellisense from "./intellisense.json";

const DECLARED_VARIABLES_REGEX = /(\w+)\s*=\s*.*/g;
const DECLARED_FUNCTIONS_REGEX = /(\w+)\s*\(.*\)/g;

const documentFilter: vscode.DocumentFilter = {
  language: "uniscript",
  scheme: "file",
};

function getDeclaredVariables(document: vscode.TextDocument) {
  const text = document.getText();

  const declaredVariables = [...text.matchAll(DECLARED_VARIABLES_REGEX)].map(
    (match) => match[1]
  );

  return declaredVariables;
}

function getDeclaredFunctions(document: vscode.TextDocument) {
  const text = document.getText();

  const declaredFunctions = [...text.matchAll(DECLARED_FUNCTIONS_REGEX)].map(
    (match) => match[1]
  );

  return declaredFunctions;
}

export function activate(context: vscode.ExtensionContext) {
  const uniscriptCompletionProvider =
    vscode.languages.registerCompletionItemProvider(documentFilter, {
      provideCompletionItems(document, position, token, context) {
        const keywords = intellisense.keywords.map((item) => {
          const completionItem = new vscode.CompletionItem(
            item.name,
            vscode.CompletionItemKind.Keyword
          );

          completionItem.insertText = new vscode.SnippetString(item.snippet);

          return completionItem;
        });

        const variables = getDeclaredVariables(document).map((variable) => {
          const completionItem = new vscode.CompletionItem(
            variable,
            vscode.CompletionItemKind.Variable
          );

          return completionItem;
        });

        const functions = getDeclaredFunctions(document).map((funcion) => {
          const completionItem = new vscode.CompletionItem(
            funcion,
            vscode.CompletionItemKind.Function
          );

          return completionItem;
        });

        const constants = intellisense.constants.map((constant) => {
          const completionItem = new vscode.CompletionItem(
            constant,
            vscode.CompletionItemKind.Constant
          );

          return completionItem;
        });

        return [...keywords, ...variables, ...functions, ...constants];
      },
    });

  const uniscriptHoverProvider = vscode.languages.registerHoverProvider(
    documentFilter,
    {
      provideHover(document, position, token) {
        const word = document.getText(
          document.getWordRangeAtPosition(position)
        );

        const keyword = intellisense.keywords.find(
          (item) => item.name === word
        );

        if (!keyword) {
          return;
        }

        return new vscode.Hover(new vscode.MarkdownString(keyword.description));
      },
    }
  );

  context.subscriptions.push(uniscriptCompletionProvider);
  context.subscriptions.push(uniscriptHoverProvider);
}

export function deactivate() {}
