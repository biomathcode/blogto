import * as vscode from 'vscode';

import { getNonce } from './getNonce';

import { dev_API_URL, medium_API_URL, postToDev, postToMedium } from './utils';
import { LocalStorageService } from './storage';

function stringToArray(word: string, chr: string) {
    const array = word.split(chr);
    return array;
}

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'alert': {
                    vscode.window.showInformationMessage(message.text);
                }
                case 'dev': {
                    vscode.window.showInformationMessage(message.text);
                }
                case 'postToMedium': {
                    const medium_API_TOKEN = await LocalStorageService.getValue('mediumAPI_TOKEN');
                    const api_url = await medium_API_URL;

                    const userInfo = await LocalStorageService.getValue('medium_USER');

                    if (userInfo && medium_API_TOKEN && api_url) {
                        const userData = JSON.parse(userInfo);

                        vscode.window.showInformationMessage('posted to medium');

                        const content: string = vscode.window.activeTextEditor?.document.getText() || ' ';

                        const title = message.title;

                        const contentFormat: string = 'markdown';

                        const tags = stringToArray(message.tags, ',');

                        const publishStatus = message.publishStatus;

                        const notifyFollowers: boolean = message.notifyFollowers === 'true' ? true : false;

                        const data = await postToMedium(
                            api_url,
                            medium_API_TOKEN,
                            userData.id,
                            title,
                            contentFormat,
                            content,
                            tags,
                            publishStatus,
                            notifyFollowers,
                        );

                        return vscode.window.showInformationMessage(data);
                    }
                }
                case 'postToDev': {
                    const dev_API_TOKEN = await LocalStorageService.getValue('devAPI_TOKEN');
                    const api_url = await dev_API_URL;
                    const title = message.title;
                    const bodymarkdown: string = vscode.window.activeTextEditor?.document.getText() || ' ';

                    const publish = message.publish === 'true' ? true : false;

                    const tags = stringToArray(message.tags, ',');

                    console.log(dev_API_TOKEN, api_url, title, bodymarkdown, tags, message.publish);

                    if (dev_API_TOKEN) {
                        const data = await postToDev(api_url, dev_API_TOKEN, title, bodymarkdown, tags, publish, ' ');

                        vscode.window.showInformationMessage(data.url);
                    } else {
                        vscode.window.showInformationMessage('dev to api token not found!');
                    }

                    vscode.window.showInformationMessage(message.title);
                }
                case 'postToHashnode': {
                }
                case 'onInfo': {
                    if (!message.value) {
                        return;
                    }
                }
                case 'onError': {
                    if (!message.value) {
                        return;
                    }
                }
            }
        });
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Use a nonce to only allow a specific script to be run.

        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));

        const sidebarcss = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sideview.css'));

        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sideview.js'));
        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
      

        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${sidebarcss}" rel="stylesheet">


			</head>
      <body>

      <div class="tab tab-container">
        <button class="tablinks" id="dev" > Dev </button>
        <button class="tablinks" id="medium" >Medium</button>
        <button class="tablinks" id="hashnode" >Hashnode</button>
    </div>
        
    <div id="Dev" class="tabcontent">
    
        <h2>dev to</h2>
    
        <form action="post" id="dev_">
        <div>
        <label for="title">title</label><br>
        <input type="text" id="dev-title" name="title" /><br>
        </div>
    
        <div>
        <label for="publish">Publish:</label>
    
        <select name="publish" id="dev-publish">
                <option value="false">false</option>
            <option value="true">true</option>
        </select>
        </div>
        <div>
            <label for="tags">tags(eg.. react, javascript)</label><br>
            <input  type="tags" id="dev-tags" name="tags"/><br>
        </div>
        <button type="submit" id="dev-btn" >Submit</button>
    
        </form>
    </div>
        <div id="Medium" class="tabcontent">
            <h2>Medium</h2>
            <form method="post" id="medium_">
                <div>
                  <label for="title">medium title</label><br>
                 <input type="text" id="medium-title" name="medium-title" /><br>
                </div>
            <div>
                <label for="tags">tags</label><br>
                <input  type="tags" id="medium-tags" name="tags"/><br>
            </div>
            <div class="flex-row">
            <label for="publishStatus">publishStatus</label><br>

            <select name="publishStatus" id="medium-publishStatus">

                <option value="public">public</option>
                <option value="draft">draft</option>
                <option value="unlisted">unlisted</option>
            </select>
            </div>
            <div class="flex-row">
            <label for="notifyFollowers">notify Followers</label><br>
            <select name="notifyFollowers" id="medium-notifyFollowers">
            
                <option value="false">False</option>
                <option value="true">True</option>
            </select>
            </div>
            <button type="submit">Submit</button>
            </form>
        </div>

        <div id="Hashnode" class="tabcontent">
            <h3>Hashnode</h3>
            <form method="post" id="hashnode_">
                <div>
                <label for="title">title</label><br>
                <input type="text" id="title" name="title" /><br>
                </div>
                <div>
            <label for="tags">tags</label><br>
            <input  type="tags" id="tags" name="tags"/><br>
        </div>
        <button type="submit">Submit</button>
            </form>
        </div>


        	</body>
            <script nonce="${nonce}" src="${scriptUri}"></script>

			</html>`;
    }
}
