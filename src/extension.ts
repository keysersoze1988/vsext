import * as vscode from 'vscode';

var rp = require('request-promise');
rp.debug = true;
const parseUrl = require('url').parse;

let endpoint = "";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('exampleView', new TreeDataProvider());
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  onDidChangeTreeData?: vscode.Event<TreeItem|null|undefined>|undefined;

  data: TreeItem[] = [];
  laureates: TreeItem[] = [];

  constructor() {

    this.laureates =  [
      new TreeItem(
          'Ford')];

    var options = {
      method: 'GET',
      uri: 'http://api.nobelprize.org/2.0/nobelPrize/med/1990',
      json: true // Automatically stringifies the body to JSON
  };
  
  rp(options)
      .then( (parsedBody:any) => {
          // POST succeeded...
          parsedBody[0].laureates.forEach((element: { fullName: { en: string; }; }) => {
            this.laureates.push( new TreeItem(element.fullName.en));
          }); 
          this.data = [new TreeItem('laureates', this.laureates)];
      })
      .catch(function (err:any) {
          // POST failed...
          console.log(err);
      });
      
  }

  getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[]|undefined;

  constructor(label: string, children?: TreeItem[]) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
  }
}