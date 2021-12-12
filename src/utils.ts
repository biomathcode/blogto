import axios from 'axios';
import { LocalStorageService } from './storage';
import * as vscode from 'vscode';



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
    vscode.window.showInformationMessage(post.data.url);
    return post.data;
};

export const postToMedium = async (
    apiUrl: string,
    apiToken: string,
    userID: string,
    title: string,
    contentFormat: string,
    content: string,
    tags: Array<String>,
    publishStatus: string,
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
    vscode.window.showInformationMessage(post.data.data.url);

    return post.data.data.url;
};

export const postToHashnode = async (apiUrl: string, apiToken: string) => {
    const post = await axios({
        url: apiUrl,
        headers: {
            "Content-Type": 'application/json',
            "Authorization": apiToken,
        },
        method: 'POST',
        data: {},
    });
};


export const allUserInfo = async () => {
    const hashnodeUser = await LocalStorageService.getValue('HASHNODE_USER');
    const devUser = await LocalStorageService.getValue('DEV_USER');
    const mediumUser = await LocalStorageService.getValue('MEDIUM_USER');

    console.log(hashnodeUser, devUser, mediumUser);
    return ;
};