import { Component, OnInit } from '@angular/core';
import { worldDataService } from '../world-data.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
	selector: 'app-world-evolution',
	templateUrl: './world-evolution.component.html',
	styleUrls: ['./world-evolution.component.css']
})
export class WorldEvolutionComponent implements OnInit {
	public barChartOptions: ChartOptions = {
		responsive: true,
		scales: { xAxes: [{}], yAxes: [{}] },
		plugins: {
			datalabels: {
			anchor: 'end',
			align: 'end',
			}
		}
	};
	public barChartType: ChartType = 'bar';
	public barChartLegend: boolean = true;
	public barChartData: any[] = [];
	public barChartLabels: Label[] = [];

	public lineChartData: ChartDataSets[] = [];
	public lineChartLabels: Label[] = [];
	public lineChartOptions = {
	  responsive: true,
	};
	public lineChartLegend = true;
	public lineChartType: ChartType = 'line';

	constructor(public worldDataService: worldDataService){}
	ngOnInit(): void {
		let since: Date = new Date("2020-04-13");
		this.worldDataService.updateFirebaseDailyData(since).then(()=>{

			let today = new Date();
			let daysago8 = new Date(new Date().setDate(today.getDate()-7));
			let daysago7 = new Date(new Date().setDate(today.getDate()-6));

			this.worldDataService.loadSinceData(daysago8, today).then((data: any)=>{

				console.log("Weekly data loaded");

				let newDeaths = new Array(7)
				let newRecovered = new Array(7)
				let newConfirmed = new Array(7)

				for (let _i=1; _i<data["totalDeaths"].length; _i++){
					newDeaths[_i - 1] =  data["totalDeaths"][_i] - data["totalDeaths"][_i-1]
					newRecovered[_i - 1] =  data["totalRecovered"][_i] - data["totalRecovered"][_i-1] 
					newConfirmed[_i - 1] =  data["totalConfirmed"][_i] - data["totalConfirmed"][_i-1] 
				}

				this.barChartData = [
					{data: newDeaths, label: "New Deaths"},
					{data: newRecovered, label: "New Recovered"},
					{data: newDeaths, label: "New Confirmed"}
				];

				let labels: Label[] = new Array();
				for (let date of this.worldDataService.getDaysArray(daysago7, today)){
					labels.push(this.worldDataService.toDateString(date));
				}
				this.barChartLabels = labels;

			})
			
			this.worldDataService.loadSinceData(since, today).then((data: any)=>{

				console.log("Since 2020-04-13 data loaded");
				this.lineChartData = [
					{data: data["totalDeaths"], label: "Total Deaths"},
					{data: data["totalRecovered"], label: "Total Recovered"},
					{data: data["totalConfirmed"], label: "Total Confirmed"}
				];
				let labels: Label[] = new Array();
				for (let date of this.worldDataService.getDaysArray(since, today)){
					labels.push(this.worldDataService.toDateString(date));
				}
				this.lineChartLabels = labels;
			})
		})
	}
}