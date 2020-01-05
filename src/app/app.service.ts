import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    
    private ip;

    constructor(private http: HttpClient) { }

    setRelayState(relay, state) {
        return this.http.get(`${this.getUrl()}s/${relay}/${state}`);
    }

    getDeviceStatus() {
        return this.http.get(`${this.getUrl()}api/device/state`);
    }

    setIp(ip: String) {
        this.ip = ip;
    }
    
    getUrl(): String {
        return `http://${this.ip}/`;
    }

}