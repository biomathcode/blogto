import * as vscode from 'vscode';
import { SidebarProvider } from './sidebar';
import { LocalStorageService } from './storage';

import { allUserInfo, devApiUrl, getuserDev, getuserhashnode, getUserMedium, hashnodeApiUrl, mediumApiUrl } from './utils';

import { HelloWorldPanel } from "./panels/HelloWorldPanel";

export function activate(context: vscode.ExtensionContext) {
	LocalStorageService.globalState = context.globalState;
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('blog-sidebar', sidebarProvider));

    const openConfig = vscode.commands.registerCommand("blogto.openconfig", () => {
        HelloWorldPanel.render(context.extensionUri);
    });

    context.subscriptions.push(openConfig);

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.getActiveText', async () => {
            console.log(vscode.window.activeTextEditor?.document.languageId);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.hashnode_getuser', async () => {
            vscode.window.showInformationMessage('working on your request');
            const hashnodeApiToken = await LocalStorageService.getValue('HASHNODE_API_TOKEN');
            const hashnodeUsername = await LocalStorageService.getValue('HASHNODE_USERNAME');
            console.log(hashnodeApiToken, hashnodeUsername);

            if (hashnodeUsername && hashnodeApiToken) {
                const result = await getuserhashnode(hashnodeUsername, hashnodeApiToken, hashnodeApiUrl);
     
                vscode.window.showInformationMessage(
                    JSON.stringify(result) ? 'Successfully added user info' : 'failed',
                );
            } else {
                vscode.window.showInformationMessage('Please set configs for hashnode ');
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.user_info',
        () => 
        allUserInfo())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.dev_getuser', async () => {
            const devApiToken = await LocalStorageService.getValue('DEV_API_TOKEN');
            if (devApiToken) {
                getuserDev(devApiUrl, devApiToken);
                vscode.window.showInformationMessage('successfully updated dev user info');
            } else {
                vscode.window.showInformationMessage('Please set configs for dev.to');
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('blogto.medium_getuser', async () => {
            const mediumApiToken = await LocalStorageService.getValue('MEDIUM_API_TOKEN');
            if (mediumApiToken) {
                getUserMedium(mediumApiUrl, mediumApiToken);
                vscode.window.showInformationMessage('succesfully updated medium user info');
            } else {
                vscode.window.showInformationMessage('Please set configs for medium');
            }
        }),
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
