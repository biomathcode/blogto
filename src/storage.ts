'use strict';

import { Memento } from 'vscode';
import * as vscode from 'vscode';

export class LocalStorageService {
    static globalState: Memento;

    static getValue(key: string): string | undefined {
        return this.globalState.get(key);
    }

    static setValue(key: string, value: string | undefined): any {
        return this.globalState.update(key, value);
    }
}
