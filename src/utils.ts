import axios from 'axios';
import { LocalStorageService } from './storage';
import * as vscode from 'vscode';

interface Request {
    username?: string;
    api_url: string;
    api_token: string;
}

const hashnode_USERNAME: string = 'pratiksharm';

const hashnode_API_TOKEN: string = '80458ae0-c222-4f7d-80f1-cb1da6e1f678';

export const hashnode_API_URL: string = 'https://api.hashnode.com';

export const dev_API_TOKEN: string = 'GbK2jc26was1Uhh8Dtb3oS4c';

export const dev_API_URL: string = 'https://dev.to/api';

export const medium_API_URL: string = 'https://api.medium.com/v1';

const medium_API_TOKEN: string = '2e5c442b93cb141e668c5949c721c0457c0d976309b2443bd0250bcc84d9ef4b7';

export const getuserhashnode = async (username: string, api_token: string, api_url: string) => {
    const user = await axios({
        url: api_url,
        headers: {
            'Content-Type': 'application/json',
            Authorization: api_token,
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

    LocalStorageService.setValue('hashnode_USER', JSON.stringify(user.data));

    return user.data.data.user;
};

export const getuserMedium = async (api_url: string, api_token: string) => {
    const user = await axios({
        baseURL: api_url,
        url: '/me',
        headers: {
            Authorization: `Bearer ${api_token}`,
        },
    });

    console.log(user.data.data);
    LocalStorageService.setValue('medium_USER', JSON.stringify(user.data.data));
};

export const getuserDev = async (api_url: string, api_token: string) => {
    const user = await axios({
        baseURL: api_url,
        url: '/users/me',
        headers: {
            'api-key': api_token,
        },
    });

    console.log(user.data);

    LocalStorageService.setValue('dev_USER', JSON.stringify(user.data));
};

export const postToDev = async (
    api_url: string,
    api_token: string,
    title: string,
    body_markdown: string,
    tags: Array<string>,
    published: boolean,
    series: string,
) => {
    const post = await axios({
        url: api_url + '/articles',
        headers: {
            'api-key': api_token,
        },
        method: 'POST',
        data: {
            article: {
                title: title,
                published: published,
                body_markdown: body_markdown,
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
    api_url: string,
    api_token: string,
    userID: string,
    title: string,
    contentFormat: string,
    content: string,
    tags: Array<String>,
    publishStatus: string,
    notifyFollowers: boolean,
) => {
    const post = await axios({
        baseURL: api_url,
        url: `/users/${userID}/posts`,
        headers: {
            Authorization: `Bearer ${api_token}`,
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

export const postToHashnode = async (api_url: string, api_token: string) => {
    const post = await axios({
        url: api_url,
        headers: {
            'Content-Type': 'application/json',
            Authorization: api_token,
        },
        method: 'POST',
        data: {},
    });
};
