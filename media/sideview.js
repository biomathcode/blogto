(function () {
    console.log('running .....')
    const vscode = acquireVsCodeApi();


    const dev = document.getElementById('dev')

    const medium = document.getElementById('medium')

    document.getElementById('medium_').addEventListener('submit', function (e) {
        e.preventDefault();
        console.log(e)
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
        })

    })

    //
    document.getElementById("dev_").addEventListener("submit", function (e) {
        e.preventDefault();
        console.log(e);

        const title = document.getElementById('dev-title').value

        const publish = document.getElementById('dev-publish').value

        const tags = document.getElementById('dev-tags').value
        vscode.postMessage({
            command: 'postToDev',
            text: 'commplete form',
            title,
            publish,
            tags
        })
    });




    medium.onclick = mediumActivate;

    function mediumActivate() {
        document.getElementById('Medium').style.display = "block";
        document.getElementById('Hashnode').style.display = 'none';
        document.getElementById('Dev').style.display = 'none';
    }

    const hashnode = document.getElementById('hashnode')

    hashnode.onclick = activateHashnode;

    function activateHashnode() {
        document.getElementById('Hashnode').style.display = "block";

        document.getElementById('Medium').style.display = 'none';
        document.getElementById('Dev').style.display = 'none';
    }

    dev.onclick = myFunction;
    function myFunction() {
        document.getElementById('Dev').style.display = 'block';

        document.getElementById('Medium').style.display = 'none';
        document.getElementById('Hashnode').style.display = 'none';
    }



    window.addEventListener('message', event => {

        const message = event.data; // The JSON data our extension sent

        switch (message.command) {
            case 'alert':
                break;
            case 'dev':
                count = 100;
                console.log('dev has send count to 100')
                break;
        }
    });


}());
