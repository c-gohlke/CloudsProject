import { Component, OnInit } from '@angular/core';
import { countryDataService } from '../../services/country-data.service';
import { worldDataService } from '../../services/world-data.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { LiveData } from 'src/app/models/live-data.model';

@Component({
	selector: 'app-country-live',
	templateUrl: './country-live.component.html',
	styleUrls: ['./country-live.component.css']
})
export class CountryLiveComponent implements OnInit {
		liveData: LiveData = new LiveData();
		deathRateString: string|undefined;
		recoveryRateString: string|undefined;
		public country: string = ""


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

	constructor(public worldDataService: worldDataService, private route: ActivatedRoute){}
	async ngOnInit(): Promise<void> {
		this.country = this.route.snapshot.paramMap.get("country")!;
		this.worldDataService.loadLiveData([this.country]).then((countryDataObj : any)=>{
			console.log("Live data loaded");
			this.liveData  = countryDataObj[this.country];
			this.pieChartData = [{
				data: [
					this.liveData["totalDeaths"],
					this.liveData["totalRecovered"],
					this.liveData["activeConfirmed"]
				],
			}];
			this.deathRateString =  (this.liveData.deathRate!*100).toFixed(2) + "%";
			this.recoveryRateString =  (this.liveData.recoveryRate!*100).toFixed(2) + "%";
		}); 
	}
}