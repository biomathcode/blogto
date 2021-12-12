import * as vscode from 'vscode';
import { LocalStorageService } from '../storage';

import { getUri } from '../utilities/getUri';


export class HelloWorldPanel {
    public static currentPanel: HelloWorldPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._panel.onDidDispose(this.dispose, null, this._disposables);

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

        this._setWebviewMessageListener(this._panel.webview);

    }

    public static render(extensionUri: vscode.Uri) {
        if (HelloWorldPanel.currentPanel) {
            HelloWorldPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel("helloworld", "Hello World", vscode.ViewColumn.One, {
                // Empty for now
                enableScripts: true,
            });

            HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri);
        }
    }

    public dispose() {
        HelloWorldPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

  
    private _setWebviewMessageListener(webview: vscode.Webview) {
      
      webview.onDidReceiveMessage(
        (message: any) => {
          const command = message.command;
          const text = message.text;
  
          switch (command) {
            case "hello":
              // Code that should run in response to the hello message command
              vscode.window.showInformationMessage(text);
              return;
            case "configSetup": 

              message?.hashnodeApiToken !== null ?
              LocalStorageService.setValue('HASHNODE_API_TOKEN', message.hashnodeApiToken)
              : 
              vscode.window.showInformationMessage('hashnode api token not found');
              

              message?.hashnodeUsername !== null ? 
              LocalStorageService.setValue('HASHNODE_USERNAME', message.hashnodeUsername)
              : 
              vscode.window.showInformationMessage('hashnode username not found');

              //setting up devapitoken in local storage and fetching the user data 
              message?.devApiToken !== null ?
              (() => {
                console.log('this is executed ');
              LocalStorageService.setValue('DEV_API_TOKEN', message.devApiToken);
              LocalStorageService.getValue('DEV_API_TOKEN') && vscode.commands.executeCommand('blogto.dev_getuser').then(() => {
                vscode.window.showInformationMessage('dev user is fetched');
              });

              })()
              : 
              vscode.window.showInformationMessage('dev.to api token not found!');

              message?.mediumApiToken !== null ?
              (() => {
              LocalStorageService.setValue('MEDIUM_API_TOKEN', message.mediumApiToken);
              LocalStorageService.getValue('MEDIUM_API_TOKEN') && vscode.commands.executeCommand('blogto.medium_getuser').then(() => {
                vscode.window.showInformationMessage('medium user is fetched');
              });
              })()
              :
              vscode.window.showInformationMessage('Medium api token not found !');

              if (LocalStorageService.getValue('HASHNODE_USERNAME') && LocalStorageService.getValue('HASHNODE_API_TOKEN')) {
                vscode.commands.executeCommand('blogto.hashnode_getuser');
              }

              vscode.window.showInformationMessage(text);
              return ;
          }
        },
        undefined,
        this._disposables
      );
    }


  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    const toolkitUri = getUri(webview, extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);
    const mainUri = getUri(webview, extensionUri, ["media", "main.js"]);

   

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="module" src="${toolkitUri}"></script>
          <script type="module" src="${mainUri}"></script>

          <title>Config page</title>
        </head>
        <body>
          <h1>Config</h1>
          <vscode-text-field id="dev_api_token">Dev.to api token</vscode-text-field>
          <vscode-text-field id="medium_api_token">Medium api token</vscode-text-field>
          <vscode-text-field id="hashnode_username">Hashnode username</vscode-text-field>
          <vscode-text-field id="hashnode_api_token">Hashonde api token</vscode-text-field>
          <div>

          <vscode-button id="save">Save </vscode-button>
          </div>
        </body>
      </html>
    `;

    
  }

  


}

