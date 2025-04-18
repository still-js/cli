# StillJS CLI
This is the CLI tool for StillJS Framework


<div style="display:flex; justify-content: center">
    <img src="https://github.com/still-js/core/blob/HEAD/@still/img/logo-no-bg.png" style="width: 5em;"/>
</div>

## The Still.js Framework

StillJS is a Web UI Framework which helps you to build your user interfaces which uses Vanilla JavaScript, yet the component approach is the main focus allowing you to modulrize your UI in the same fashion we do with React and Angular. visit the <a href="https://still-js.github.io/stilljs-doc/" target="_blank">official documentation</a> for deeper overview.

<br>

#### still-cli Commands options overview
Once installed globally, the command can be called by its aliaes which are <b>`st`</b> or <b>`still`</b>, will use still for the coming examples:
<table style="width: 100%;">
    <tr style="font-weight: bold;">
        <td>
            Command
        </td>
        <td>
            Params
        </td>
        <td>
            Description
        </td>
        <td>
            Example
        </td>
    </tr>
    <tr>
        <td>
            init
        </td>
        <td>
            N/A
        </td>
        <td>
            Initiates a new project in the current folder
        </td>
        <td>
            npx still <b>init</b>
        </td>
    </tr>
    <tr>
        <td>
            lone
        </td>
        <td>
            N/A
        </td>
        <td>
            Setup the files for a Lone/CDN based project using still
        </td>
        <td>
            npx still <b>lone</b>
        </td>
    </tr>
    <tr>
        <td>
            serve
        </td>
        <td>
            N/A
        </td>
        <td>
            Runs the app and open in th browser
        </td>
        <td>
            npx still <b>serve</b>
        </td>
    </tr>
    <tr>
        <td>
            create
        </td>
        <td>
            <b>--lone</b> : Creates a Lone component within ad Lone/CDN based component
        </td>
        <td>
            Creates a new component in both regular Still project or Lone/CDN based project, and add a new route to the <b><i>route.map.js</i></b> file
        </td>
        <td>
            npx still <b>create</b> component path-to/MyComponent
        </td>
    </tr>
    <tr>
        <td>
            route
        </td>
        <td>
            N/A
        </td>
        <td>
            Display the routes in the project
        </td>
        <td>
            npx still <b>route</b> list
        </td>
    </tr>
</table>

<br>
<br>

#### Brief Documentation
A complete documentation is not yet available, as the work is in progress, anyway there is quite of content and documentation available on the Github, <a href="https://still-js.github.io/stilljs-doc/" target="_blank">click here</a>.

<br>

#### 1. Instalation

The official documentation concerning environment set up and project creation can be found <a href="https://still-js.github.io/stilljs-doc/installation-and-running/" target="_blank">here</a>; cli tools needs to be installed globally as follow bellow:

```
npm i @stilljs/cli -g
```

<br>

#### 2. Creating a project
Create a folder for you project (e.g. project-name) and from inside such folder init the project as the bellow instruction
```
npx still init
```

After initiating the project the framework structure and files are download to the folder.

<br>

##### 2.1 Project structure
```js
    project-name //My project folder
    |___ @still // Still.js framework
    |___ app // Folder which holdes to app files
    |     |__ HomeComponent.js //Component generated automatically when creating project
    |__ app-setup.js //App configuration file/class
    |__ app-template.js //App template scheleton
    |__ index.html //Application container
    |__ jsconfig.js //Basic configuration for vscode
    |__ package.json // Regular package JSON
    |__ route.map.json // Component routing and path file

```

<br>

### 3. Usage example
```js
import { ViewComponent } from "../../@still/component/super/ViewComponent.js";

export class HomeComponent extends ViewComponent {

    /** 
     * isPublic flag is needed for any component that is publicly accessible, therefore, 
     * when dealing with authentication and permission scenario any component requiring
     * user permission the flag will be removed or turned to false
     */
    isPublic = true;
    template = `
        <div>
            <h2>Hello world!</h2>
            <p>
            I'm an easy component with a button
            </p>
            <button>I'm a button</button>
        </div>
    `;
}
```
<br>

#### 3.1 Running the project

From the project root folder, use still-cli to run the app as follow:
```
npx still app serve
```

#### You're all set with Still.js project, Enjoy your coding! <b style="font-size: 50px; color: orange;">&#x263B;</b>

<br>
<hr>

#### Alternative from CDN

First thing first, Still.js CDN based project are also named Lone component, and it's recommender for them to be create using <b>`still-cli`</b> in addition to add to CDN in the page file itself (e.g. <b>.html</b>), as both the <b>`app/`</b> folder and the <b>`route.map.js`</b> file are needed even in this case, but the framework will be served from the CDN itself, hence, project structure can be as follow:
<br>

##### Project structure example:
```js
    project-name //My project root folder
    |___ microfrontend // This is simply for isolating from my project files
    |     |__ app/ //Component will be placed in here following the folder structure as I will
    |     |    |__ //MyCustomComponent.js -- This component will be created bellow (point b.)
    |     |__ route.map.js //still-cli will add the route automatically when creating a component
    |     | 
    // Bellow are the files of my project placed in the project root folder
    |__ index.html
    |__ my-project-folder/
    |__ ... // Additional files from my project

```

<br>
<br>


##### a. Creating Lone/CDN based project:
Creating the project inside the `microfrontend/` folder:
```
npx still lone
```

<br>


##### b. Creating the component from inside the `microfrontend/` folder:
Using <b>`--lone`</b> peram at the end is mandatory when creating a component within a CND based project.
```js
npx still create component app/MyCustomComponent --lone
```

<br>


##### c. Including CDN files in my regular page file:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <title>StillJS</title>
    <!-- Bellow is the Still environment variable to inform where to look for components -->
    <script> STILL_HOME = 'microfrontend/' </script>
    <!-- Bellow both JavaScript and CSS CDN inclusion, JS type neeeds to module -->
    <link href="https://cdn.jsdelivr.net/npm/@stilljs/core@latest/@still/ui/css/still.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/@stilljs/core@latest/@still/lone.js" type="module"></script>
</head>

<body>
    <div>
        <!-- Bellow component (MyCustomComponent) needs to be created as in step previous step (step c.) -->
        <st-element component="MyCustomComponent"></st-element>
    </div>
</body>
```

<br>


##### d. Running the project:
On the Lone/CDN based project the application won't be run using still-cli, but it needs to be serve by an HTTP server, for testing purpose `live-server` can be used, and it needs to be run from the project root folder not from the still project sub-folder, follow the example:
```
npx live-server
```
<br>

When using CDN <b>Still.js</b> provides also with the capability of creating <b>powerfull Microfrontend</b> solutions in addition to regular component approach, follow the official documentation on how to set it up <a href="https://still-js.github.io/stilljs-doc/installation-and-running-cdn/" target="_blank">here</a>.


<br>

# You're all set, Congrats!