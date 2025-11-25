import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'angular-tree-component';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [provideZoneChangeDetection(),importProvidersFrom(BrowserModule, FormsModule, TreeModule, CommonModule, AppRoutingModule)]
})
  .catch(err => console.log(err));
