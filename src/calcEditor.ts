import { appendFile } from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class CalcEditorProvider implements vscode.CustomTextEditorProvider {

    private static readonly view = 'calc.document';

    constructor(
        private readonly context: vscode.ExtensionContext) {

    }

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new CalcEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(CalcEditorProvider.view, provider)
        return providerRegistration;
    }

    resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken): void | Thenable<void> {

            webviewPanel.webview.options = {
                enableScripts: true
            };
            webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

            function updateWebview() {
                webviewPanel.webview.postMessage({
                    type: 'update',
                    text: document.getText()
                })
            };

            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
                if(e.document.uri.toString() === document.uri.toString()) {
                    updateWebview();
                }
            });

            webviewPanel.onDidDispose(() =>{
                changeDocumentSubscription.dispose();
            });

            webviewPanel.webview.onDidReceiveMessage(e => {
                this.updateDocument(document, e.text);
            });

            updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {

        const scriptSrc = webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'resources', 'js', 'main.js')));
        const stylesPath = webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'resources', 'css', 'main.css')));

        return /* html */`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Calc Webview</title>
                    
				    <link href="${stylesPath}" rel="stylesheet">
                </head>
                
                <body>
                    <div id="flow-container">
                        <div id="editor" contenteditable="true">Hello world!</div>
                        <div id="tape"></div>
                    </div>
                    <script src="${scriptSrc}></script>
                </body>
            </html>
        `;
    }

    private updateDocument(document: vscode.TextDocument, text: string) {
        const edit = new vscode.WorkspaceEdit();

        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text
        );

        return vscode.workspace.applyEdit(edit);
    }
    
}