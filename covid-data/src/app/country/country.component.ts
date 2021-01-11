import { Component, OnInit } from '@angular/core';
import { countryDataService } from '../services/country-data.service';
import { userService } from '../services/user.service';
import { monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, BaseChartDirective } from 'ng2-charts';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  constructor(public countryDataService: countryDataService, public userService: userService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  };

  ngOnInit(): void {
  }
}