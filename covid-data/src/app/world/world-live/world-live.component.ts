import { Component, OnInit } from '@angular/core';
import { worldDataService } from '../../services/world-data.service';
import { LiveData } from '../../models/live-data.model';
import { Label } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
    selector: 'app-world-live',
    templateUrl: './world-live.component.html',
    styleUrls: ['./world-live.component.css']
})
export class WorldLiveComponent implements OnInit {
    liveData: LiveData = new LiveData();

    public pieChartOptions: ChartOptions = {
        responsive: true,
        title: {
          text: 'Coronavirus Cases Distribution Worldwide',
          display: false
        }
      };
      public pieChartLabels: Label[] = ['Dead Cases', 'Recovered Cases', 'Active Cases'];
      public pieChartData: any[] = [];
      public pieChartType: ChartType = 'pie';

    constructor(public worldDataService: worldDataService){}
    ngOnInit(): void {
        this.worldDataService.updateFirebaseLiveData().then(() =>{

            this.worldDataService.loadLiveData().then((liveData: any) => {
      
              console.log("Live data loaded");
              this.pieChartData = [{
                data: [
                  liveData.get("totalDeaths"),
                  liveData.get("totalRecovered"),
                  liveData.get("activeConfirmed")
                ],
              }];
      
              this.liveData = {
                activeConfirmed: liveData.get("activeConfirmed"),
                deathRate: (liveData.get("deathRate")*100).toFixed(2) + "%",
                lastUpdated: liveData.get("lastUpdated"),
                newConfirmed: liveData.get("newConfirmed"),
                newDeaths: liveData.get("newDeaths"),
                newRecovered: liveData.get("newRecovered"),
                recoveryRate: (liveData.get("recoveryRate")*100).toFixed(2) + "%",
                totalConfirmed: liveData.get("totalConfirmed"),
                totalDeaths: liveData.get("totalDeaths"),
                totalRecovered: liveData.get("totalRecovered")
              };
            });
        });
    }
}