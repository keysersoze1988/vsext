import * as vscode from 'vscode';

var rp = require('request-promise');
rp.debug = true;

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('exampleView', new TreeDataProvider());
  vscode.commands.registerCommand("exampleView.selectNode", (item:vscode.TreeItem) => {
    vscode.workspace.openTextDocument({
      content: item.label?.toString(), 
      language: "text"
    });
    
});
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {

  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

  private _onDidChangeSelection: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeSelection: vscode.Event<TreeItem | undefined> = this._onDidChangeSelection.event;

  

  data: TreeItem[] = [];
  laureates: TreeItem[] = [];

  constructor() {
    this.getLaureates(); 

    this.laureates =  [
      new TreeItem(
          'Ford')];
         
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {               
         return  this.data;   
    }
    else{
    return element.children;
    }
  }

 async getLaureates(){
 
    var options = {
      method: 'GET',
      uri: 'http://api.nobelprize.org/2.0/nobelPrize/med/1990',
      json: true // Automatically stringifies the body to JSON
  };
  
  rp(options)
      .then( (parsedBody:any) => {
          // POST succeeded...
          parsedBody[0].laureates.forEach((element: { fullName: { en: string; }; }) => {
            let item = new TreeItem(element.fullName.en);
            item.command = {
              command: "exampleView.selectNode",
              title: "Select Node",
              arguments: [item]
          };
            this.laureates.push(item);
          });         
          this.data = [new TreeItem('laureates', this.laureates)];
          this.refresh();              
      })
      .catch(function (err:any) {
          // POST failed...
          console.log(err);
      });

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