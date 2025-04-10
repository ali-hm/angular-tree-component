import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExampleComponent } from './code-example.component';
import { CodeModule } from './code.module';
import { WithCustomElementComponent } from '../element-registry';

@NgModule({
    imports: [CommonModule, CodeModule, CodeExampleComponent],
    exports: [CodeExampleComponent]
})
export class CodeExampleModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = CodeExampleComponent;
}
