import * as vscode from 'vscode';
import { CalcEditorProvider } from './calcEditor';

export function activate(context: vscode.ExtensionContext) {

	// Register editor
	context.subscriptions.push(CalcEditorProvider.register(context));

	let disposable = vscode.commands.registerCommand('calc.showResults', () => {
		// TODO open new editor?
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
