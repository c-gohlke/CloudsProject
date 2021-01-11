import { Component, OnInit } from '@angular/core';
import { countryDataService } from '../../services/country-data.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-country-live',
	templateUrl: './country-live.component.html',
	styleUrls: ['./country-live.component.css']
})
export class CountryLiveComponent implements OnInit {
    public country: string = ""

    todayData: any = new Object();

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

	constructor(public countryDataService: countryDataService, private route: ActivatedRoute){}
	ngOnInit(): void {
        this.country = this.route.snapshot.paramMap.get("country")!
        this.countryDataService.updateFirebaseLiveCountryData(this.country).then(() =>{

            this.countryDataService.loadLiveCountryData(this.country).then((liveData: any) => {
      
              console.log("Live data loaded");
              this.pieChartData = [{
                data: [
                  liveData.get("totalDeaths"),
                  liveData.get("totalRecovered"),
                  liveData.get("activeConfirmed")
                ],
              }];
      
              this.todayData = {
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