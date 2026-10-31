import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';

registerLocaleData(localePt, 'pt-BR');
bootstrapApplication(AppComponent, { providers: [provideRouter([])] }).catch(err => console.error(err));
