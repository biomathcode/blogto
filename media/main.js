const vscode = acquireVsCodeApi();

window.addEventListener('load', main);

function main() {
    document.getElementById('save').addEventListener('click', handleConfig);
}

function handleConfig() {
    const hashnodeApiToken = document.getElementById('hashnode_api_token').value;
    const hashnodeUsername = document.getElementById('hashnode_username').value;

    const mediumApiToken = document.getElementById('medium_api_token').value;
    const devApiToken = document.getElementById('dev_api_token').value;

    console.log(hashnodeApiToken, hashnodeApiToken, mediumApiToken);
    vscode.postMessage({
        command: 'configSetup',
        text: 'Setting up the config data!! 🔥', 
        hashnodeApiToken,
        hashnodeUsername, 
        mediumApiToken,
        devApiToken
    });

}
