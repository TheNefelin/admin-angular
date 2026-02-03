import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiResponseService<R,T> {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private apiKey = environment.apiKey

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'ApiKey': this.apiKey,
      'Content-Type': 'application/json'
    });
  }

  getAll(endpoint: string): Observable<R> {
    return this.http.get<R>(
      `${this.apiUrl}/${endpoint}`,
      { headers: this.getHeaders() }
    );
  }

  getById(endpoint: string, id: string | number): Observable<R> {
    return this.http.get<R>(
      `${this.apiUrl}/${endpoint}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  create(endpoint: string, data: T): Observable<R> {
    return this.http.post<R>(
      `${this.apiUrl}/${endpoint}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  update(endpoint: string, data: T): Observable<R> {
    return this.http.put<R>(
      `${this.apiUrl}/${endpoint}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  delete(endpoint: string, id: string | number): Observable<R> {
    return this.http.delete<R>(
      `${this.apiUrl}/${endpoint}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
