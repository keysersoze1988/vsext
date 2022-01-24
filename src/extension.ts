import * as vscode from 'vscode';

var rp = require('request-promise');
rp.debug = true;


export async function activate(context: vscode.ExtensionContext) {

  let searchText;

 let res = await vscode.window.showInputBox({
    placeHolder: "Search query",
    prompt: "Search my snippets on Codever",
    value: searchText
  });


  vscode.window.registerTreeDataProvider('exampleView', new TreeDataProvider(res));
  vscode.commands.registerCommand("exampleView.selectNode", (item:TreeItem) => {
    vscode.workspace.openTextDocument({
      content: item.args, 
      language: "text"    
    });
    
});

console.log(searchText);
}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {

  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

  private _onDidChangeSelection: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeSelection: vscode.Event<TreeItem | undefined> = this._onDidChangeSelection.event;

  

  data: TreeItem[] = [];
  laureates: TreeItem[] = [];

  constructor(searchText:string|undefined) {
    this.getLaureates(searchText);          
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

 async getLaureates(searchText:string|undefined){
 
if (searchText !==undefined){

 let requestParams = searchText?.split('&');

    var options = {
      method: 'GET',
      uri: `http://api.nobelprize.org/2.0/nobelPrize/${requestParams[0]}/${requestParams[1]}`,
      json: true // Automatically stringifies the body to JSON
  };
  
  rp(options)
      .then( (parsedBody:any) => {
          // POST succeeded...
          parsedBody[0].laureates.forEach((element: { fullName: { en: string; } ,portion:string, motivation:{en:string},
            links:{href:string},id:string}) => {
            let item = new TreeItem(element.fullName.en,undefined,this.createDetailPageText(element));
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

 createDetailPageText(args: { fullName: { en: string; } ,portion:string, motivation:{en:string},
                              links:{href:string},id:string}):any{
   let content:string = `Full Name: ${args.fullName.en}\n`;
   content += `Portion: ${args.portion}\n`;
   content += `Motivation: ${args.motivation.en}\n`;
   content += `Link: ${args.links.href}`;
   return content;
 }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[]|undefined;
  args:any;

  constructor(label: string, children?: TreeItem[],args?:any) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
    this.args = args;
  }
}

