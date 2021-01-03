import { Component, OnInit } from '@angular/core';
import { covidDataService } from '../covid-data.service';
import { CovidData } from '../covid-data.model';
import { Label, monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { createOfflineCompileUrlResolver } from '@angular/compiler';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  activeConfirmed: number|undefined;
  deathRate: String|undefined;
  lastUpdated: any;
  newConfirmed: number|undefined
  newDeaths: number|undefined
  newRecovered: number|undefined
  recoveryRate: String|undefined;
  totalConfirmed: number|undefined
  totalDeaths: number|undefined
  totalRecovered: number|undefined

  PIE_CHART_TITLE = 'Coronavirus Cases Distribution Worldwide';

  public pieChartOptions: ChartOptions = {
    responsive: true,
    title: {
      text: this.PIE_CHART_TITLE,
      display: false
    }
  };
  public pieChartLabels: Label[] = ['Dead Cases', 'Recovered Cases', 'Active Cases'];
  public pieChartData: any[] = [];
  public pieChartType: ChartType = 'pie';

  constructor(public covidDataService: covidDataService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit(): void {
    this.covidDataService.checkUpdateData().subscribe((checkUpdateData: boolean)=>{
      console.log("checking if need to update the data " + checkUpdateData)
      if(checkUpdateData){
        console.log("getting covid data ")
        this.covidDataService.getCovidData().subscribe((res: any)=>{
          let tConfirmed: number = res["Global"]["TotalConfirmed"];
          let tDeaths: number = res["Global"]["TotalDeaths"];
          let tRecovered: number = res["Global"]["TotalRecovered"];
    
          let newData: CovidData = {
            activeConfirmed: tConfirmed - tDeaths - tRecovered,
            newConfirmed: res["Global"]["NewConfirmed"],
            deathRate: tDeaths/tConfirmed,
            lastUpdated: new Date(),
            newDeaths: res["Global"]["NewDeaths"],
            newRecovered: res["Global"]["NewRecovered"],
            recoveryRate: tRecovered/tConfirmed,
            totalConfirmed: tConfirmed,
            totalDeaths: tDeaths,
            totalRecovered: tRecovered
          };
          console.log("updating data " + newData)
          this.covidDataService.updateData(newData);
        });
      }
    });

    this.covidDataService.loadCovidData().subscribe((covidData: CovidData)=>{
      console.log("loading data from firebase ")
      console.log(covidData)

      this.activeConfirmed = covidData["activeConfirmed"];
      this.deathRate = (covidData["deathRate"]!*100).toFixed(2) + "%";
      this.lastUpdated = covidData["lastUpdated"];
      this.newConfirmed = covidData["newConfirmed"];
      this.newDeaths = covidData["newDeaths"];
      this.newRecovered = covidData["newRecovered"];
      this.recoveryRate = (covidData["recoveryRate"]!*100).toFixed(2) + "%";
      this.totalConfirmed = covidData["totalConfirmed"];
      this.totalDeaths = covidData["totalDeaths"];
      this.totalRecovered = covidData["totalRecovered"];

      this.pieChartData = [
        {
          data: [
            this.totalDeaths,
            this.totalRecovered,
            this.activeConfirmed
          ],
        }
      ];
    });
  }
}
