# angular tree component
This is a fork of [@circlon/angular-tree-component](https://github.com/CirclonGroup/angular-tree-component). 
Since it appears that the original project has been abandoned, I have decided to take on its development and ensure compatibility with Ivy and newer versions of Angular.
## Getting started

Install `angular-tree-component`:

```npm install @ali-hm/angular-tree-component```

Import `TreeModule`:

```
import { TreeModule } from '@ali-hm/angular-tree-component';

@NgModule({
  declarations: [AppComponent],
  imports: [TreeModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Add css to `styles.scss` or include in `angular.json`:

```
@import '@ali-hm/angular-tree-component/css/angular-tree-component.css';
```

## Docs, Demos & More

## Support

## Angular supported version

angular-tree-component supports angular 12+ versions, and AoT compilation.

versioning has been change to align with supported Angular version.
so:\
v21.\*.\* = Angular 21 \
v20.\*.\* = Angular 20   
v19.\*.\* = Angular 19  
v18.\*.\* = Angular 18  
v17.\*.\* = Angular 17  
v16.\*.\* = Angular 16  
v12.\*.\* = Angular 14-15  
## Contributing


