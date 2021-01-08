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

@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    CountryComponent,
    WorldLiveComponent,
    WorldEvolutionComponent,
    CountryLiveComponent,
    CountryEvolutionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    ChartsModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }