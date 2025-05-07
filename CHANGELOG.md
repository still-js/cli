
# Change Log
This log contains all the changes which takes place for StillJS CLI tools.
 

## [Released] - 2025-05-06
## [Version] - 1.7.13
Fix ViewComponent import path generation when generating a component.

<br>
<hr>
<p>&nbsp;</p>
<p>&nbsp;</p>





 

 

## [Released] - 2025-04-07
## [Version] - 1.7.2
Adjustments, new features and improvements on the still-cli.
 
### Added
- <b>MEDIUM</b> - Added init command to for project initialization.
    <b>&nbsp;&nbsp;&nbsp;&nbsp;example: </b> `npx still init`

<br>

- <b>MEDIUM</b> - Added lone command to for Lone/CDN based project initialization.
    <b>&nbsp;&nbsp;&nbsp;&nbsp;example: </b> `npx still lone`

<br>

- <b>MEDIUM</b> - Added serve command for running the application.
    <b>&nbsp;&nbsp;&nbsp;&nbsp;example: </b> `npx still serve`

<br>

- <b>MAJOR</b> - `--lone` para to the create command for when creating a component within a Lone/CDN base project.
    <b>&nbsp;&nbsp;&nbsp;&nbsp;example: </b> `npx still create component path-to/MyComponent --lone`


### Removed
- App creation under `stiil create` command.

<br>
<hr>
<p>&nbsp;</p>
<p>&nbsp;</p>





 

## [Released] - 2025-03-20
## [Version] - 1.6.2
Adjustments, new features and improvements on the still-cli.
 
### Fixes
- <b>MINOR</b> - Path and URL generation when creation component from Root folder.
- <b>MINOR</b> - command `app` and `serve` parameter.

<br>
<hr>
<p>&nbsp;</p>
<p>&nbsp;</p>





## [Released] - 2025-03-19
## [Version] - 1.6.1
Adjustments, new features and improvements on the still-cli.
 
### Added
- <b>MINOR</b> - URL column when list routes with still command

- <b>MINOR</b> - Constraint and error when trying to creat a project outside of a still project folder
 

### Changed
- <b>MEDIUM</b> - Logic for restructuring Route generation and also to add url for each generated route.

- <b>MINOR</b> - Merge full path and path to a single column when listing the routes.

- <b>MINOR</b> - changes on the initial content of the generated component to be indentend and to consider css class intead of inline css.

### Removed
- <b>MINOR</b> - restrictions to not allow component creationg from the root folder of the project.

### Fixes
- <b>MAJOR</b> - Route command list (l) alias.

<br>
<hr>
<p>&nbsp;</p>
<p>&nbsp;</p>






## [Released] - 2025-03-05
## [Version] - 1.6.0
Changed Windows Powershell commands by NodeJS native file system functions.
 
### Changed
- <b>MAJOR</b> - From CMD File system manipulation to NodeJS native fs implementations for moving/copying and releding files.
<br>
<hr>
<p>&nbsp;</p>
<p>&nbsp;</p>






 
## [Released] - 2025-03-05
## [Version] - 1.5.0
Added Windows Powershell capabilities on still-cli for handling cmd execution.
 
### Added
- <b>MAJOR</b> - still-cli CMD Exec capabilities for Windows/Powershell to allow project unwrap when creating it

- <b>MAJOR</b> - still-cli CMD Exec capabilities for Windows/Powershell to allow project unwrap library installation
 
- <b>MAJOR</b> - New still-cli alias point to ```stilljs``` in addition to ```still``` and ```st``` previously existed.
<br>
<hr>
<p>&nbsp;</p>
<p>&nbsp;</p>







  
 
