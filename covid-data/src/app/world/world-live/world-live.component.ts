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
	deathRateString: string|undefined;
	recoveryRateString: string|undefined;

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
	async ngOnInit(): Promise<void> {
		console.log("loading live data")
		this.liveData = await this.worldDataService.loadLiveData();

		console.log("live data loaded");
		this.pieChartData = [{
			data: [
				this.liveData["totalDeaths"],
				this.liveData["totalRecovered"],
				this.liveData["activeConfirmed"]
			],
		}];
		this.deathRateString =  (this.liveData.deathRate!*100).toFixed(2) + "%";
		this.recoveryRateString =  (this.liveData.recoveryRate!*100).toFixed(2) + "%";
	}	
}