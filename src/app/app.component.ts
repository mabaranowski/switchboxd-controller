import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private relay: Number = 0;

  constructor(private service: AppService) { }

  @HostListener('document:keydown.space')
  changeRelay() {
    this.relay === 0 ? this.relay = 1 : this.relay = 0;
    console.log(this.relay);
  }

  ngOnInit() {
    this.service.setRelayState(this.relay, 0).subscribe(resp => {
      console.log(resp);
    })
  }

  toggleSwitch() {
    this.service.setRelayState(this.relay, 2).subscribe(resp => {
      console.log(resp);
    })

    // this.service.getDeviceStatus().subscribe(resp => {
    //   console.log(resp);
    // });
  }

}
