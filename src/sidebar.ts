import * as vscode from 'vscode';

import {  devApiUrl, hashnodeApiUrl, mediumApiUrl, postToDev, postToHashnode, postToHashnodePublish, postToMedium } from './utils';
import { LocalStorageService } from './storage';
import { getUri } from './utilities/getUri';

function stringToArray(word: string, chr: string) {
    const array = word.split(chr);
    return array;
}

function slugToUrl(slug: string) {
  const url = slug.replace(/\s+/g, '-');
  return url;
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


        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'alert': {
                    vscode.window.showInformationMessage(message.text);
                }
                case 'config': {
                    vscode.commands.executeCommand('blogto.openconfig');
                    vscode.window.showInformationMessage(message.text);

                }
                case 'postToMedium': {
                    const mediumApiToken =  LocalStorageService.getValue('MEDIUM_API_TOKEN');
                    const apiUrl =  mediumApiUrl;

                  
                    const userInfo =  LocalStorageService.getValue('MEDIUM_USER');

                    if(vscode.window.activeTextEditor?.document.languageId !== "markdown") {
                      return vscode.window.showInformationMessage('Please open markdown file in the active text editor');
                    }

                    console.log(vscode.window.activeTextEditor?.document);

                    if (userInfo && mediumApiToken && apiUrl) {
                        const userData = JSON.parse(userInfo);
                        const tags = stringToArray(message.tags, ',');
                        if(tags.length > 5) {
                          return vscode.window.showWarningMessage('Only 5 tags are allowed!!');
                      };


                      vscode.window.showInformationMessage('posting to medium');




                        const content: string = vscode.window.activeTextEditor?.document.getText() || ' ';

                        const title = message.title;

                        const contentFormat = 'markdown';

                        

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
                        console.log(data);


                        return vscode.window.showInformationMessage('posted to medium');
                    }
                    break;
                }
                case 'postToDev': {
                    if(vscode.window.activeTextEditor?.document.languageId !== "markdown") {
                      return vscode.window.showInformationMessage('Please open markdown file in the active text editor');
                    }
                    const tags = stringToArray(message.tags, ',');

                    if(tags.length > 5) {
                      return vscode.window.showWarningMessage('Only 5 tags are allowed!!');
                  };
                    
                    const devApiToken = await LocalStorageService.getValue('DEV_API_TOKEN');
                    const apiUrl = await devApiUrl;
                    const title = message.title;
                    const bodymarkdown: string = vscode.window.activeTextEditor?.document.getText() || ' ';

                    const publish = message.publish === 'true' ? true : false;
                    console.log(devApiToken, apiUrl, title, bodymarkdown, tags, message.publish);

                    if (devApiToken) {
                        const data = await postToDev(apiUrl, devApiToken, title, bodymarkdown, tags, publish, ' ');

                        vscode.window.showInformationMessage(data.url);
                    } else {
                        vscode.window.showInformationMessage('dev to api token not found!');
                    }

                    vscode.window.showInformationMessage(message.title);

                    break;
                }
                case 'postToHashnode': {
                  if(vscode.window.activeTextEditor?.document.languageId !== "markdown") {
                    return vscode.window.showInformationMessage('Please open markdown file in the active text editor');
                  }

                  
                  const hashnodeApiToken = await LocalStorageService.getValue('HASHNODE_API_TOKEN'); 

                  const apiUrl = await hashnodeApiUrl;
                  const title = message.title;
                  const bodymarkdown: string = vscode.window.activeTextEditor?.document.getText() || ' ';

                  const slug =  slugToUrl(message.slug);
                  const publish = message.publish === "true" ? true : false;
                  const publicationId = message.publicationId;

                  const tags =  JSON.parse(
                    message.tags
                  );

                  const coverImageUrl = message.coverImage || " ";

                  const visibleOnHashnode = message.visibility === 'true' ? true: false;

                  if(hashnodeApiToken && bodymarkdown) {
                    
                    if(publish) {
                      const post = await postToHashnodePublish(
                        apiUrl,
                        hashnodeApiToken,
                        publicationId,
                        tags,
                        title,
                        bodymarkdown,
                        slug,
                        coverImageUrl,
                        visibleOnHashnode
                      );
                      vscode.window.showInformationMessage(post);

                      return post;
                     

                    } else {
                      const post = await postToHashnode(
                        apiUrl, 
                        hashnodeApiToken,
                        title,
                        slug,
                        bodymarkdown,
                        coverImageUrl,
                        tags
                        );
                        vscode.window.showInformationMessage('post to hashnode', `https://hashnode.com/@pratiksharm`);

                      return post;
                    }
                  }else {
                    vscode.window.showInformationMessage('Please set hashnode Api token and username');

                  }

                  break;

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

        let devUser, mediumUser, hashnodeUser;
        
        if(LocalStorageService.getValue('DEV_USER')) {
          devUser = LocalStorageService.getValue('DEV_USER');
          devUser = JSON.parse(devUser || " ");
        }
        
        if(LocalStorageService.getValue('MEDIUM_USER')){
         mediumUser = LocalStorageService.getValue('MEDIUM_USER');
          mediumUser = JSON.parse(mediumUser || " ");
        }
        if(LocalStorageService.getValue('HASHNODE_USER')) {
         hashnodeUser = LocalStorageService.getValue('HASHNODE_USER');
          hashnodeUser = JSON.parse(hashnodeUser || " ");
        }

        const hashnodeTags = [
            {
              "_id": "56744721958ef13879b94cad",
              "name": "JavaScript"
            },
            {
              "_id": "56744723958ef13879b95434",
              "name": "React"
            },
            {
              "_id": "56744721958ef13879b94d67",
              "name": "Python"
            },
            {
              "_id": "56744722958ef13879b94ffb",
              "name": "Node.js"
            },
            {
              "_id": "56744721958ef13879b94b91",
              "name": "CSS"
            },
            {
              "_id": "56744723958ef13879b955a9",
              "name": "Beginner Developers"
            },
            {
              "_id": "56744721958ef13879b94c9f",
              "name": "Java"
            },
            {
              "_id": "56744723958ef13879b952d7",
              "name": "Developer"
            },
            {
              "_id": "56744720958ef13879b947ce",
              "name": "Tutorial"
            },
            {
              "_id": "56744722958ef13879b94fd9",
              "name": "PHP"
            },
            {
              "_id": "56744721958ef13879b94bc5",
              "name": "AWS"
            },
            {
              "_id": "56744723958ef13879b9532b",
              "name": "learning"
            },
            {
              "_id": "56744721958ef13879b94ae7",
              "name": "programming blogs"
            },
            {
              "_id": "56744721958ef13879b94bd0",
              "name": "Go Language"
            },
            {
              "_id": "56744723958ef13879b954c1",
              "name": "coding"
            },
            {
              "_id": "56a399f292921b8f79d3633c",
              "name": "Frontend Development"
            },
            {
              "_id": "56744721958ef13879b94c63",
              "name": "GitHub"
            },
            {
              "_id": "5f22b52283e4e9440619af83",
              "name": "#codenewbies"
            },
            {
              "_id": "56744723958ef13879b95342",
              "name": "Python 3"
            },
            {
              "_id": "56744723958ef13879b952af",
              "name": "webdev"
            },
            {
              "_id": "567ae5a72b926c3063c3061a",
              "name": "Hashnode"
            }
          ];

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
      

      <vscode-panels activeid="dev" class="container" >

        <vscode-panel-tab id="dev">Dev.to</vscode-panel-tab>
        <vscode-panel-tab id="medium">MEDIUM</vscode-panel-tab>
        <vscode-panel-tab id="hashnode">Hashnode</vscode-panel-tab>
        <vscode-panel-view id="dev">
        <div>
            <div class="flex-row" style="display: ${!devUser ? "none": null}">
                <img src="${devUser?.profile_image}"/>
                <h5>${devUser?.name}</h5>
            </div>
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
        <div class="flex-row" style="display: ${!mediumUser ? "none": null}">
        <img src="${mediumUser?.imageUrl}"/>
        <h5>${mediumUser?.name}</h5>
    </div>
  
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
            <vscode-button id="medium-btn" type="submit">Submit</vscode-button>
            </form>
        </div>
          
        </vscode-panel-view>

        <vscode-panel-view id="hashnode">
        <div>
        <div class="flex-row" style="display: ${!hashnodeUser ? "none": null}">
            <img src="${hashnodeUser?.photo}" />
            <h5>${hashnodeUser?.name}</h5>
        </div>
        <p id="hashnode-publication" value=${hashnodeUser?.publication._id}>${hashnodeUser?.publication.title}</p>

        
            <form method="post" id="hashnode_">
           
                <vscode-text-area type="text" id="hashnode-title" name="title">
                Title
                </vscode-text-area>
            
            <vscode-text-field type="text" id="hashnode-cover" name="coverImageUrl">
                Cover Image Url
        </vscode-text-field>
        <div id="tagLabel" class="tagLabel">
        </div>
        <div class="flex-column">
        <label for="select-tags">
        Tag
        </label>
        <select id="select-tags" >
          ${ 
              hashnodeTags.map((tag) => {
                  return (
                      `<option class="option" name="${tag.name}" value="${tag._id}">
                      ${tag.name}
                      </option>`
                  );
              })
          }
        </select>
        </div>
        <div>

            <label for="visibleHashnode">
            Visible 
            on hashnode
            </label>
            <vscode-dropdown name="visibleHashnode" id="hashnode-visibility">
            <vscode-option value="false">False</vscode-option>
            <vscode-option value="true">True</vscode-option>
        </vscode-dropdown>
    </div>
    <div>
        <label for="hashnode-publish">
            Publish
        </label>
        <vscode-dropdown name="hashnode-publish" id="hashnode-publish">
            <vscode-option value="false">False</vscode-option>
            <vscode-option value="true">True</vscode-option>
        </vscode-dropdown>
    </div>
      <vscode-text-field type="text" id="hashnode-slug" name="slug">
      slug
  </vscode-text-field>
  <div>
  <vscode-button id="hashnode-btn" >Post</vscode-button>


  </div>

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
