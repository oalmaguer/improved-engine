import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, delay, retryWhen, scan } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReplicateService {
  private readonly REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
  
  constructor(private http: HttpClient) {}

  generateImage(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Token YOUR_REPLICATE_API_TOKEN',
      'Content-Type': 'application/json'
    });

    const body = {
      version: "8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f",
      input: {
        prompt: prompt
      }
    };

    return this.http.post(this.REPLICATE_API_URL, body, { headers }).pipe(
      switchMap((response: any) => this.pollResult(response.id, headers))
    );
  }

  private pollResult(id: string, headers: HttpHeaders): Observable<any> {
    return new Observable(subscriber => {
      const checkStatus = () => {
        this.http.get(`${this.REPLICATE_API_URL}/${id}`, { headers })
          .subscribe((response: any) => {
            if (response.status === 'succeeded') {
              subscriber.next(response.output);
              subscriber.complete();
            } else if (response.status === 'failed') {
              subscriber.error('Image generation failed');
            } else {
              setTimeout(checkStatus, 1000);
            }
          });
      };
      checkStatus();
    });
  }
}