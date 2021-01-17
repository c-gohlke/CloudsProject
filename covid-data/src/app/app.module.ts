import { BrowserModule } from '@angular/platform-browser';
import { ChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorldComponent } from './world/world.component';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CountryComponent } from './country/country.component';
import { WorldLiveComponent } from './world/world-live/world-live.component';
import { WorldEvolutionComponent } from './world/world-evolution/world-evolution.component';
import { CountryLiveComponent } from './country/country-live/country-live.component';
import { CountryEvolutionComponent } from './country/country-evolution/country-evolution.component';
import { NewsComponent } from './world/news/news.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CountryNewsComponent } from './country/country-news/country-news.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { AuthComponent } from './auth/auth.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    CountryComponent,
    WorldLiveComponent,
    WorldEvolutionComponent,
    CountryLiveComponent,
    CountryEvolutionComponent,
    CountryNewsComponent,
    NewsComponent,
    HeaderComponent,
    FooterComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    ChartsModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSortModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }