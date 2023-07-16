import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{

  sub: Subscription;

  isApiCalling = true;

  projetData: any;

  getDataFormAPI: any;

  selectedDate = '';

  noData = '---';

  productForm!: FormGroup;

  displayColumns: string[] = ['datetime', 'name', 'count', 'completed', 'legth'];

  constructor(
    private service: DataService
  ) {
    this.sub = new Subscription();
  }

  ngOnInit(): void {
    
    // get all data from json-server
    this.getAllData();
  }

  // get data from API
  getAllData(): void {

    const getData = this.service.getSummaryData().subscribe({
      next: (res) => {
        if (!!res) {
          this.getDataFormAPI = JSON.parse(JSON.stringify(res));        
          this.projetData = this.processData(res[0]?.Datas);
          this.isApiCalling = false;
        } else {
          alert('Sorry, No data is there');  
          this.isApiCalling = false;
        }
      },
      error: () => {
        alert('Error !! while fetching data');
        this.isApiCalling = false;
      }
    });

    this.sub.add(getData);
  }


  // proccess get data
  processData(data: any): any {

    let finalRes:any = [];

    data?.forEach((element:any) => {
      let mapped = element?.Properties.map((item:any) => ({ [String(item.Label).split(' ').join('_')]: item.Value }) );
      let newObj = Object.assign({}, ...mapped, {'date_time': element['SamplingTime']});
      finalRes.push(newObj);
    });
    return finalRes;
  }


  // selecting data & get respective data
  getFormData(obj: any) {
    this.selectedDate = obj?.date_time;
    this.createForm(obj)
  }


  // from group
  createForm(obj?: any): void {

    this.productForm = new FormGroup ({
      name: new FormControl(obj?.Project_Name || '', Validators.required),
      count: new FormControl(obj?.Construction_Count || 0, Validators.required),
      completed: new FormControl(obj?.Is_Construction_Completed || false, Validators.required),
      length: new FormControl(obj?.Length_of_the_road || 0, Validators.required)
    })
  }


  // moving to 2nd tab create form
  selectedTabChange(index: number): void {

    if (index === 1) {
      this.createForm();
    }
  }


  // update data
  updateData(): void {

    let formData = this.productForm.getRawValue();
    let assignValue = [
      {
        Value: formData.name,
        Label: "Project Name",
      },
      {
        Value: formData.count,
        Label: "Construction Count"
      },
      {
        Value: formData.completed,
        Label: "Is Construction Completed"
      },
      {
        Value: formData.length,
        Label: "Length of the road"
      }
    ]

    let apiData = JSON.parse(JSON.stringify(this.getDataFormAPI));
    let id = apiData[0].id;

    apiData[0]?.Datas?.map((ele:any) => {
      if (ele?.SamplingTime === this.selectedDate) {      
        ele.Properties = assignValue;
      }
    });

    let updateData = this.service.updateDetail(id, apiData[0]).subscribe({
      next: (res) => {
        if (!!res) {
          alert('Succcessfully updated.')
          this.getAllData();
        }
      }
    });

    this.sub.add(updateData);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
