import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeComponent } from './code.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PrettyPrinter } from './pretty-printer.service';
import { CopierService } from '../../shared/copier.service';

@NgModule({
    imports: [CommonModule, MatSnackBarModule, CodeComponent],
    exports: [CodeComponent],
    providers: [PrettyPrinter, CopierService]
})
export class CodeModule { }
