import { Component, OnInit } from '@angular/core';
import { countryDataService } from './country-data.service';
import { monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, BaseChartDirective } from 'ng2-charts';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  constructor(public countryDataService: countryDataService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  };

  ngOnInit(): void {
  }
}