import { enableProdMode, importProvidersFrom } from '@angular/core';


import { environment } from './environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from './app/app-routing.module';
import { CustomElementsModule } from './app/custom-elements/custom-elements.module';
import { CodeExampleModule } from './app/custom-elements/code/code-example.module';
import { TreeModule } from 'angular-tree-component';
import { FundamentalsModule } from './app/fundamentals/fundamentals.module';
import { GuidesModule } from './app/guides/guides.module';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatButtonModule, AppRoutingModule, CustomElementsModule, CodeExampleModule, TreeModule, FundamentalsModule, GuidesModule),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
