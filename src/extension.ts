import * as vscode from "vscode";
import intellisense from "./intellisense.json";

const DECLARED_VARIABLES_REGEX = /(\w+)\s*=\s*.*;/g;

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

export function activate(context: vscode.ExtensionContext) {
  const uniscriptCompletionProvider =
    vscode.languages.registerCompletionItemProvider(documentFilter, {
      provideCompletionItems(document, position, token, context) {
        const keywords = intellisense.keywords.map((item) => {
          const completionItem = new vscode.CompletionItem(
            item.name,
            vscode.CompletionItemKind.Keyword
          );

          completionItem.documentation = new vscode.MarkdownString(
            item.description
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

        return [...keywords, ...variables];
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

        if (!keyword) return;

        return new vscode.Hover(new vscode.MarkdownString(keyword.description));
      },
    }
  );

  context.subscriptions.push(uniscriptCompletionProvider);
  context.subscriptions.push(uniscriptHoverProvider);
}

export function deactivate() {}
