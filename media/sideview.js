(function () {
    console.log('running .....');
    const vscode = acquireVsCodeApi();

    document.getElementById('config').addEventListener('click', function (e)  {
        vscode.postMessage({
            command: 'config',
            text: 'Open config webview'
        });
    });
    const tags = document.getElementById('select-tags');

    const tagLabel = document.getElementById('tagLabel');

   


    let tagList = [];  

    

    
    tags.addEventListener('change', function (e) {
        if(tagList.length >= 5) {
            tags.disabled = true;
            return;
        }
        const tagExists = tagList.some(tag => tag._id === e.target.value);

        if(tagExists){
            return;
        }
        const createElement = document.createElement('h5');
        const id = e.target.value;
        createElement.textContent = tags.options[tags.selectedIndex].getAttribute('name');
        createElement.value = e.target.value;
        createElement.id = e.target.value;
        const span = `<vscode-tag appearance="secondary" id="${id}" >x
        </vscode-tag>`;
        createElement.innerHTML += span;
        tagLabel.appendChild(createElement);
        document.getElementById(id).addEventListener('click', (e) => {
            tagList = tagList.filter(tag => tag._id !== id);
            document.getElementById(`${id}`).remove();
            if(tagList.length < 5) {
                tags.disabled = false;
            }
        });
        const tagName = tags.options[tags.selectedIndex].getAttribute('name');

        console.log(e.target.value, tagName );

       

        tagList.push({
            _id: e.target.value
        });


        console.log(tagList);
    });

    if(tagList.length >= 5) {
        tags.disabled = true;
    }

    

    document.getElementById('medium-btn').addEventListener('click', function (e) {
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
    document.getElementById("dev-btn").addEventListener("click", function (e) {
        e.preventDefault();
        console.log(e);

        const title = document.getElementById('dev-title').value;

        const publish = document.getElementById('dev-publish').value;

        const tags = document.getElementById('dev-tags').value;

        console.log(title, publish, tags);
        vscode.postMessage({
            command: 'postToDev',
            text: 'commplete form',
            title,
            publish,
            tags
        });
    });

    document.getElementById('hashnode-btn').addEventListener('click', (e) => {
        e.preventDefault();
        console.log(e);

        const title = document.getElementById('hashnode-title').value;
        const publish = document.getElementById('hashnode-publish').value;

        const visibility = document.getElementById('hashnode-visibility').value;
        const coverImageUrl = document.getElementById('hashnode-cover')?.value;
        const slug = document.getElementById('hashnode-slug').value;

        const publicationId = document.getElementById('hashnode-publication').getAttribute('value');
        

        const tags = JSON.stringify(tagList);

        vscode.postMessage({
            command: 'postToHashnode',
            text: "Posted to hashnode",
            title,
            publish,
            tags,
            visibility,
            coverImageUrl,
            slug,
            tags,
            publicationId
        });


    })  ;

    

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
