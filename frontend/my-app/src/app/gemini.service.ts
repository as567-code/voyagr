import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private http: HttpClient) {}

  getDestinationRecommendations(count: number, searchTerm: string = ''): Observable<any[]> {
    if (!environment.openRouterApiKey) {
      return of([]);
    }

    let prompt = `Generate ${count} unique travel destination recommendations.`;
    if (searchTerm) {
      prompt += ` Focus on destinations related to "${searchTerm}".`;
    }
    prompt += ` For each destination, provide a name and a brief description (2-3 sentences). Do NOT include any image URLs. Return ONLY a raw JSON array, no markdown, no code fences. Each object: {"name": "...", "description": "..."}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Voyagr'
    });

    const body = {
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      messages: [
        { role: 'user', content: prompt }
      ]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      tap(response => {
        console.log('Raw OpenRouter response:', response);
      }),
      map(response => {
        let content = response.choices[0]?.message?.content?.trim() || '[]';
        // Strip markdown code fences if present
        if (content.startsWith('```')) {
          content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        try {
          const destinations = JSON.parse(content);
          // Add reliable image URLs using loremflickr
          return destinations.map((dest: any, index: number) => ({
            ...dest,
            image: `https://loremflickr.com/600/400/${encodeURIComponent(dest.name)},travel?lock=${index}`
          }));
        } catch (error) {
          console.error('Error parsing LLM output as JSON:', content, error);
          throw error;
        }
      })
    );
  }
}
