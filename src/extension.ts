import * as vscode from 'vscode';
import { SidebarProvider } from './sidebar';
import { LocalStorageService } from './storage';
import { showInputBox } from './quickpick';
import { dev_API_URL, getuserDev, getuserhashnode, getuserMedium, hashnode_API_URL, medium_API_URL } from './utils';

import { HelloWorldPanel } from "./panels/HelloWorldPanel";

export function activate(context: vscode.ExtensionContext) {
	LocalStorageService.globalState = context.globalState;
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('blog-sidebar', sidebarProvider));

    const helloworld = vscode.commands.registerCommand("blogto.helloWorld", () => {
        HelloWorldPanel.render();

    })
    context.subscriptions.push(helloworld);

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.hashnode_getuser', async () => {
            vscode.window.showInformationMessage('working on your request');
            const hashnode_API_TOKEN = await LocalStorageService.getValue('hashnodeAPI_TOKEN');
            const hashnode_USERNAME = await LocalStorageService.getValue('hashnode_USERNAME');
            console.log(hashnode_API_TOKEN, hashnode_USERNAME);

            if (hashnode_USERNAME && hashnode_API_TOKEN) {
                const result = await getuserhashnode(hashnode_USERNAME, hashnode_API_TOKEN, hashnode_API_URL);
                vscode.window.showInformationMessage(
                    JSON.stringify(result) ? 'Successfully added user info' : 'failed',
                );
            } else {
                vscode.window.showInformationMessage('Please set configs for hashnode ');
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.dev_getuser', async () => {
            const dev_API_TOKEN = await LocalStorageService.getValue('devAPI_TOKEN');
            if (dev_API_TOKEN) {
                getuserDev(dev_API_URL, dev_API_TOKEN);
                vscode.window.showInformationMessage('successfully updated dev user info');
            } else {
                vscode.window.showInformationMessage('Please set configs for dev.to');
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.medium_getuser', async () => {
            const medium_API_TOKEN = await LocalStorageService.getValue('mediumAPI_TOKEN');
            if (medium_API_TOKEN) {
                getuserMedium(medium_API_URL, medium_API_TOKEN);
                vscode.window.showInformationMessage('succesfully updated medium user info');
            } else {
                vscode.window.showInformationMessage('Please set configs for medium');
            }
        }),
    );

    // config
    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.config', async () => {
            const options = ['hashnode', 'dev', 'Medium'].map((label) => ({
                label,
            }));
            const quickPick = await vscode.window.createQuickPick();
            quickPick.items = options;
            quickPick.onDidChangeSelection(([{ label }]) => {
                vscode.window.showInformationMessage(label);
                if (label === 'hashnode') {
                    showInputBox(' Paste your hashnode api here ', label);
                } else if (label === 'dev') {
                    showInputBox(' Paste your dev.to api token here', label);
                } else {
                    showInputBox(' Paste your medium api token here', label);
                }
            });
            quickPick.show();
        }),
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
