import { Component, OnInit, ViewChild } from '@angular/core';
import { worldDataService } from '../../services/world-data.service';
import { countryListService } from '../../services/country-list.service';
import { LiveData } from '../../models/live-data.model';
import { Label } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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

	displayedColumns: string[] = ['Country', 'NewCases', 'TotalCases', 'NewRecoveries', 'TotalRecoveries', 'NewDeaths', 'TotalDeaths'];
	dataSource = new MatTableDataSource();
	countryList: string[] = [];

	@ViewChild(MatSort) sort: MatSort = new MatSort();
	constructor(public countryListService: countryListService, public worldDataService: worldDataService) {}
	
	async ngOnInit(): Promise<void> {
		let COUNTRY_DATA: any = []
		this.countryList = await this.countryListService.loadCountriesList()
		this.worldDataService.loadLiveData(this.countryList).then((liveCountryDataList: any)=>{
			this.liveData = liveCountryDataList["world"]
			this.pieChartData = [{
				data: [
					this.liveData["totalDeaths"],
					this.liveData["totalRecovered"],
					this.liveData["activeConfirmed"]
				],
			}];
			this.deathRateString =  (this.liveData.deathRate!*100).toFixed(2) + "%";
			this.recoveryRateString =  (this.liveData.recoveryRate!*100).toFixed(2) + "%";

			for (let country of this.countryList!){
				let liveCountryData: LiveData = liveCountryDataList[country];
				//if country not in list of api/summary, returns undefined
				if(liveCountryData){
					COUNTRY_DATA.push({
						Country: country,
						NewCases: liveCountryData.newConfirmed,
						TotalCases: liveCountryData.totalConfirmed,
						NewRecoveries: liveCountryData.newRecovered,
						TotalRecoveries: liveCountryData.totalRecovered,
						NewDeaths: liveCountryData.newDeaths,
						TotalDeaths: liveCountryData.totalDeaths
					})
				}
			}
			this.dataSource = new MatTableDataSource(COUNTRY_DATA);
			this.sort!.active = "TotalCases";
			this.sort!.direction = "desc";
			this.dataSource.sort = this.sort!;
		});
	}	
}