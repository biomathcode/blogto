import axios from 'axios';
import { LocalStorageService } from './storage';
import * as vscode from 'vscode';

interface Request {
    username?: string;
    apiUrl: string;
    apiToken: string;
}

const hashnodeUsername: string = 'pratiksharm';

const hashnodeApiToken: string = '80458ae0-c222-4f7d-80f1-cb1da6e1f678';

export const hashnodeApiUrl: string = 'https://api.hashnode.com';

export const devApiToken: string = 'GbK2jc26was1Uhh8Dtb3oS4c';

export const devApiUrl: string = 'https://dev.to/api';

export const mediumApiUrl: string = 'https://api.medium.com/v1';

const mediumApiToken: string = '2e5c442b93cb141e668c5949c721c0457c0d976309b2443bd0250bcc84d9ef4b7';

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

    console.log(user.data.data);
    LocalStorageService.setValue('MEDIUM_USER', JSON.stringify(user.data.data));
};

export const getuserDev = async (apiUrl: string, apiToken: string) => {
    const user = await axios({
        baseURL: apiUrl,
        url: '/users/me',
        headers: {
            'api-key': apiToken,
        },
    });

    console.log(user.data);

    LocalStorageService.setValue('DEV_USER', JSON.stringify(user.data));
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