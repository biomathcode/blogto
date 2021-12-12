(function () {
    console.log('running .....');
    const vscode = acquireVsCodeApi();

    document.getElementById('config').addEventListener('click', function (e)  {
        vscode.postMessage({
            command: 'config',
            text: 'Open config webview'
        });
    });

    document.getElementById('medium_').addEventListener('submit', function (e) {
        e.preventDefault();
        console.log(e);
        const title = document.getElementById('medium-title').value;
        const tags = document.getElementById('medium-tags').value;
        const publishStatus = document.getElementById('medium-publishStatus').value;
        const notifyFollowers = document.getElementById('medium-notifyFollowers').vaue;


        vscode.postMessage({
            command: 'postToMedium',
            text: 'Posted to medium',
            title,
            tags,
            publishStatus,
            notifyFollowers
        });

    });

    //
    document.getElementById("dev_").addEventListener("submit", function (e) {
        e.preventDefault();
        console.log(e);

        const title = document.getElementById('dev-title').value;

        const publish = document.getElementById('dev-publish').value;

        const tags = document.getElementById('dev-tags').value;
        vscode.postMessage({
            command: 'postToDev',
            text: 'commplete form',
            title,
            publish,
            tags
        });
    });

    function createProfile(profile, name, id) {
        const p = document.createElement('img');
        p.src = profile; 
        const n = document.createElement('h5');
        n.textContent = name; 
        document.getElementById(id).append(p,n);
    }

    window.addEventListener('message', event => {
        const message = event.data; 
        switch (message.command) {
   
            case 'alert':
                break;
            case 'dev':
                count = 100;
                console.log('dev has send count to 100');
                break;
            
        }
    });


}());
