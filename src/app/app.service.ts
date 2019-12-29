import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private ip = 'http://192.168.8.50/';

    constructor(private http: HttpClient) { }

    setRelayState(relay, state) {
        return this.http.get(`${this.ip}s/${relay}/${state}`);
    }

    getDeviceStatus() {
        return this.http.get(`${this.ip}api/relay/state`);
    }

}