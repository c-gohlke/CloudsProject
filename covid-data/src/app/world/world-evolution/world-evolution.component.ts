import { Component, OnInit } from '@angular/core';
import { worldDataService } from '../../services/world-data.service';
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
		},
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
	async ngOnInit(): Promise<void> {
		let since: Date = new Date("2020-04-13");
		let dateArray: Array<Date> = this.worldDataService.getDaysArray(since, new Date())
		console.log("Loading daily data")
		let dailyDataArray: any = await this.worldDataService.loadDailyData(dateArray)
		console.log("World daily data loaded")

		let newDeaths = new Array()
		let newRecovered = new Array()
		let newConfirmed = new Array()
		let labels: Label[] = new Array();

		for (let _i=dailyDataArray["totalDeaths"].length - 7; _i<dailyDataArray["totalDeaths"].length; _i++){
			labels.push(dailyDataArray["dates"][_i-1])
			newDeaths.push(dailyDataArray["totalDeaths"][_i] - dailyDataArray["totalDeaths"][_i-1])
			newRecovered.push(dailyDataArray["totalRecovered"][_i] - dailyDataArray["totalRecovered"][_i-1])
			newConfirmed.push(dailyDataArray["totalConfirmed"][_i] - dailyDataArray["totalConfirmed"][_i-1])
		}

		this.barChartData = [
			{data: newDeaths, label: "New Deaths"},
			{data: newRecovered, label: "New Recovered"},
			{data: newDeaths, label: "New Confirmed"}
		];
		this.barChartLabels = labels;

		this.lineChartData = [
			{data: dailyDataArray["totalDeaths"], label: "Total Deaths"},
			{data: dailyDataArray["totalRecovered"], label: "Total Recovered"},
			{data: dailyDataArray["totalConfirmed"], label: "Total Confirmed"}
		];
		this.lineChartLabels = dailyDataArray["dates"];
	}
}