import * as vscode from 'vscode';
import { LocalStorageService } from './storage';

export async function showInputBox(message: string, label: string) {
    const result = await vscode.window.showInputBox({
        value: '',
        placeHolder: message,
    });

    if (label === 'hashnode') {
        LocalStorageService.setValue('hashnodeAPI_TOKEN', result);
        const username = await vscode.window.showInputBox({
            value: '',
            placeHolder: 'hashnode username',
        });
        LocalStorageService.setValue('hashnode_USERNAME', username);
        vscode.window.showInformationMessage(`username: ${username}`);
    } else if (label === 'dev') {
        LocalStorageService.setValue('devAPI_TOKEN', result);
    } else {
        LocalStorageService.setValue('mediumAPI_TOKEN', result);
    }

    vscode.window.showInformationMessage(`Got: ${result}`);
}
