import axios from 'axios';
import { LocalStorageService } from './storage';
import * as vscode from 'vscode';

//TODO: organise the request with interfaces
interface ApiCall {
    apiUrl: string
    apiToken: string
}

interface PostToDev extends ApiCall {
    title: string,
    bodyMarkdown: string,
    published: boolean,
    series: string
}

interface PostToMedium {
    apiUrl: string;
    apiToken: string;
    userId: string;
    title: string;
    contentFormat: "markdown" | "html";
    publishStatus: "draft" | "public" | "unlisted";
    notifyFollowers: boolean

}


export const hashnodeApiUrl: string = 'https://api.hashnode.com';

export const devApiUrl: string = 'https://dev.to/api';

export const mediumApiUrl: string = 'https://api.medium.com/v1';


export const getuserhashnode = async (username: string, apiToken: string, apiUrl: string) => {
    const user = await axios({
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiToken,
        },
        method: 'POST',
        data: {
            query: `
            query user($username: String!){
            user(username: $username) {
                name
                username
                photo
                location
                publicationDomain
                
                publication {
                  _id
                  title
                }
                
              }
            }
            
            `,
            variables: {
                username: username,
            },
        },
    });

    console.log(user.data.data.user);

    LocalStorageService.setValue('HASHNODE_USER', JSON.stringify(user.data.data.user));

    return user.data.data.user;
};

export const getUserMedium = async (apiUrl: string, apiToken: string) => {
    const user = await axios({
        baseURL: apiUrl,
        url: '/me',
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
    });


    return LocalStorageService.setValue('MEDIUM_USER', JSON.stringify(user.data.data));
};

export const getuserDev = async (apiUrl: string, apiToken: string) => {
    const user = await axios({
        baseURL: apiUrl,
        url: '/users/me',
        headers: {
            'api-key': apiToken,
        },
    });

    return LocalStorageService.setValue('DEV_USER', JSON.stringify(user.data));
};



export const postToDev = async (
    apiUrl: string,
    apiToken: string,
    title: string,
    bodyMarkdown: string,
    tags: Array<string>,
    published: boolean,
    series: string,
) => {
    const post = await axios({
        url: apiUrl + '/articles',
        headers: {
            'api-key': apiToken,
        },
        method: 'POST',
        data: {
            article: {
                title: title,
                published: published,
                body_markdown: bodyMarkdown,
                tags: tags,
                series: series,
            },
        },
    });
    console.log(post.data.url, post.status);
    if (published) {
        vscode.window.showInformationMessage("Your post is published!!!", 'click here')
        .then(selection =>{
            if(selection === 'click here') {
                vscode.env.openExternal(vscode.Uri.parse(post.data.url));
            }
        });

    } else {
        vscode.window.showInformationMessage('Visit the dashboard to complete your post', 'click here')
        .then(selection =>{
            if(selection === 'click here') {
                vscode.env.openExternal(vscode.Uri.parse("https://dev.to/dashboard"));
            }
        });
    }
    return post.data;
};



export const postToMedium = async (
    apiUrl: string,
    apiToken: string,
    userID: string,
    title: string,
    contentFormat: "markdown" | "html",
    content: string,
    tags: Array<String>,
    publishStatus: "draft" | "public" | "unlisted",
    notifyFollowers: boolean,
) => {
    const post = await axios({
        baseURL: apiUrl,
        url: `/users/${userID}/posts`,
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
        method: 'POST',
        data: {
            title,
            contentFormat,
            content,
            tags,
            publishStatus,
            notifyFollowers,
        },
    });

    console.log(post.data.data, post.data.data.url, post.status);
    const url = post.data.data.url; 
    vscode.window.showInformationMessage('Continue/Update your post','click here')
    .then(selection => {
        if(selection === "click here") {
            vscode.env.openExternal(vscode.Uri.parse(url));
        }
    }
       );

    return post.data.data.url;
};

export const postToHashnodePublish = async (apiUrl: string,
    apiToken: string,
    publicationId: string,
    tags: Array<Object>,
    title: string,
    markdown: string,
    slug: string,
    coverImageUrl: string,
    visibility: boolean,
) => {
    const user = JSON.parse(
        LocalStorageService.getValue('HASHNODE_USER') || ""
    );

    const post = await axios({
        url: apiUrl,
        headers: {
            "Content-Type": 'application/json',
            "Authorization": apiToken,
        },
        method: 'POST',
        data: {
            query: `
            mutation createStoryPublication(
                $title: String!,
                $publicationId:String!,
                $slug:String,
                $markdown:String!,
                $tags: [TagsInput]!,
                $visibility:Boolean,
                $coverImage:String
              ) {
                createPublicationStory(
                  publicationId: $publicationId
                  hideFromHashnodeFeed: $visibility
                  input: {
                    title: $title
                    slug:$slug
                    contentMarkdown: $markdown
                    tags: $tags
                    coverImageURL: $coverImage 
                  }
                ) {
                  success
                  post {
                  slug
                  }
                }
              }
            `,
            variables: {
                title: title, 
                tags: tags, 
                markdown:markdown, 
                publicationId:publicationId,
                coverImage: coverImageUrl,
                slug: slug,
                visibility: visibility,
            }
        },
    });
    console.log(post);
    const postSlug = post.data.data.createPublicationStory.post.slug;
    const publicationDomain = user?.publicationDomain;
    if(publicationDomain && postSlug) {
    const postUrl = `https://${publicationDomain}/${postSlug}`;
    vscode.window.showInformationMessage('Continue writing your blog here', "click here")
        .then(selection => {
            if(selection === "click here"){
                vscode.env.openExternal(vscode.Uri.parse(postUrl));

            }
        });
        return postUrl;
    }else {
        vscode.window.showErrorMessage('No publication doamin found');
    }
};


//draft most redirect https://hashnode.com/@{Username}
// post redirect to https://{userWebsite}.com/{slug}


export const postToHashnode = async (
    apiUrl: string,
    apiToken: string,
    title: string,
    slug: string,
    markdown: string,
    coverImageUrl: string,
    tags: Array<Object>,

) => {
    console.log(apiToken, apiUrl, title, slug, coverImageUrl, tags);

    const post = await axios({
        url: apiUrl,
        headers: {
            "Content-Type": 'application/json',
            "Authorization": apiToken,
        },
        method: 'POST',
        data: {
            query: `
mutation  createStory(
  $title: String!,
  $slug:String,
  $markdown:String!, 
	$tags:[TagsInput]!,
  $coverImageUrl:String
){
  createStory(
    input: {
      title: $title
      slug: $slug
      contentMarkdown: $markdown
      coverImageURL: $coverImageUrl
      tags: $tags
    }
  ){
    success
    message
    post{
      slug
    }
    
  }
}            
            `,
            variables: {
                title: title,
                slug: slug,
                markdown: markdown,
                tags: tags,
                coverImageUrl: coverImageUrl
            }

        },
    });

    console.log(post);
    console.log(post.data?.data?.createStory.post.slug);

    return post;
};


export const allUserInfo = async () => {
    const hashnodeUser = await LocalStorageService.getValue('HASHNODE_USER');
    const devUser = await LocalStorageService.getValue('DEV_USER');
    const mediumUser = await LocalStorageService.getValue('MEDIUM_USER');

    console.log(hashnodeUser, devUser, mediumUser);
    return;
};