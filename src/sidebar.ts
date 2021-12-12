import * as vscode from 'vscode';

import {  devApiUrl, mediumApiUrl, postToDev, postToMedium } from './utils';
import { LocalStorageService } from './storage';
import { getUri } from './utilities/getUri';

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

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this._extensionUri);






        const devUser = LocalStorageService.getValue('DEV_USER');

        const mediumUser = LocalStorageService.getValue('MEDIUM_USER');
    
        const hashnodeUser = LocalStorageService.getValue('HASHNODE_USER');

    
        if(devUser) {
            console.log("dev_user_info", devUser);
            const user = JSON.parse(devUser);
        
            webviewView.webview.postMessage({
            command: 'DEV_USER',
            name: user.name,
            profile: user.profile_image,
            username: user.username
          });
        }
    
        if (mediumUser) {
            console.log("medium_user_info", mediumUser);
            const user = JSON.parse(mediumUser);
            webviewView.webview.postMessage({
            command: 'MEDIUM_USER',
            name: user.name,
            username: user.username,
            profile: user.imageUrl
          });
        }
    
        if(hashnodeUser) {
            const user = JSON.parse(hashnodeUser);
            console.log("hashnode_user_info", hashnodeUser);
            
            webviewView.webview.postMessage({
            command: 'HASHNODE_USER',
            name: user.name,
            username: user.username,
            profile: user.photo,
            publicationTitle: user.publication.title,
            publicationId: user.publication._id
            
          });
        }


        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'alert': {
                    vscode.window.showInformationMessage(message.text);
                }
                case 'config': {
                    vscode.commands.executeCommand('blogto.openconfig');
                    vscode.window.showInformationMessage(message.text);

                }
                case 'dev': {
                    vscode.window.showInformationMessage(message.text);
                }
                case 'postToMedium': {
                    const mediumApiToken = await LocalStorageService.getValue('mediumAPI_TOKEN');
                    const apiUrl = await mediumApiUrl;

                    const userInfo = await LocalStorageService.getValue('medium_USER');

                    if (userInfo && mediumApiToken && apiUrl) {
                        const userData = JSON.parse(userInfo);

                        vscode.window.showInformationMessage('posted to medium');

                        const content: string = vscode.window.activeTextEditor?.document.getText() || ' ';

                        const title = message.title;

                        const contentFormat: string = 'markdown';

                        const tags = stringToArray(message.tags, ',');

                        const publishStatus = message.publishStatus;

                        const notifyFollowers: boolean = message.notifyFollowers === 'true' ? true : false;

                        const data = await postToMedium(
                            apiUrl,
                            mediumApiToken,
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
                    const devApiToken = await LocalStorageService.getValue('devAPI_TOKEN');
                    const apiUrl = await devApiUrl;
                    const title = message.title;
                    const bodymarkdown: string = vscode.window.activeTextEditor?.document.getText() || ' ';

                    const publish = message.publish === 'true' ? true : false;

                    const tags = stringToArray(message.tags, ',');

                    console.log(devApiToken, apiUrl, title, bodymarkdown, tags, message.publish);

                    if (devApiToken) {
                        const data = await postToDev(apiUrl, devApiToken, title, bodymarkdown, tags, publish, ' ');

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

    private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {

        const toolkitUri = getUri(webview, extensionUri, [
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js",
        ]);

        const stylesUri = getUri(webview, extensionUri, ["media", "sideview.css"]);

        const mainUri = getUri(webview, extensionUri, ["media", "sideview.js"]);

        return /*html*/ `
        <!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script type="module" src="${toolkitUri}"></script>
                <script type="module" src="${mainUri}"></script>
                <link rel="stylesheet" href="${stylesUri}">
                <title>BlogTo </title>
			</head>
      <body>
      <section>
      

      <vscode-panels activeid="dev" >

        <vscode-panel-tab id="dev">Dev.to</vscode-panel-tab>
        <vscode-panel-tab id="medium">MEDIUM</vscode-panel-tab>
        <vscode-panel-tab id="hashnode">Hashnode</vscode-panel-tab>
        <vscode-panel-view id="dev">
        <div>

            <div class="flex-row" id="dev_user"></div>
            <form action="post" id="dev_">
            <vscode-text-area type="text" id="dev-title" name="title">
            Title
            </vscode-text-area>
            <div class="flex-row js">
            <label for="publish">Publish:</label>
            <vscode-dropdown name="publish" id="dev-publish">
                    <vscode-option value="false">false</vscode-option>
                <vscode-option value="true">true</vscode-option>
            </vscode-dropdown>
            </div>
            <div>
                <vscode-text-area  type="tags" id="dev-tags" name="tags"
                placeholder="typescript, java"
                >
                Tags
                </vscode-text-area>
            </div>
            <vscode-button type="submit" id="dev-btn" >Submit</vscode-button>
            </form>
        </div>
        </vscode-panel-view>

        <vscode-panel-view id="medium">
        <div>
 
            <div id="medium_user" class="flex-row"></div>
            <form method="post" id="medium_">
                
                 <vscode-text-area type="text" id="medium-title">
                    Title
                 </vscode-text-area>

                 <div >
            <label for="Publish">Publish:</label><br>

            <vscode-dropdown name="publishStatus" id="medium-publishStatus">
                <vscode-option value="draft">Draft</vscode-option>
                <vscode-option value="unlisted">Unlisted</vscode-option>
                <vscode-option value="public">Public</vscode-option>
            </vscode-dropdown>
            </div>
                <vscode-text-area  type="tags" id="medium-tags"
                placeholder="typescript, java "
                >
                Tags
                </vscode-text-area>
           
            
            <div class="flex-row">
            <label for="notifyFollowers">Notify:  </label><br>
            <vscode-dropdown name="notifyFollowers" id="medium-notifyFollowers">
                <vscode-option value="false">False</vscode-option>
                <vscode-option value="true">True</vscode-option>
            </vscode-dropdown>
            </div>
            <vscode-button type="submit">Submit</vscode-button>
            </form>
        </div>
          
        </vscode-panel-view>

        <vscode-panel-view id="hashnode">
        <div>
            <div id="hashnode_user" class="flex-row"></div>
            <form method="post" id="hashnode_">
           
                <vscode-text-area type="text" id="title" name="title">
                Title
                </vscode-text-area>
            <vscode-text-area  type="tags" id="tags" name="tags"
            placeholder="typescript, java"
            >
            Tags
            </vscode-text-area>

        <vscode-button type="submit">Submit</vscode-button>
            </form>
        </div>
        </vscode-panel-view>

    </vscode-panels>

        <vscode-button type="button" id="config">config</vscode-button>
        </section>

        	</body>

			</html>`;
    }
}
