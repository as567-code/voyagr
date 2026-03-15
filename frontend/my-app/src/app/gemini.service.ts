import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Observable, from, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  getDestinationRecommendations(count: number, searchTerm: string = ''): Observable<any[]> {
    if (!environment.geminiApiKey) {
      return of([]);
    }

    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    let prompt = `Generate ${count} unique travel destination recommendations.`;
    if (searchTerm) {
      prompt += ` Focus on destinations related to "${searchTerm}".`;
    }
    prompt += ` For each destination, provide a name, a brief description (2-3 sentences), and an image URL from Unsplash (use format: https://source.unsplash.com/featured/?DESTINATION_NAME,travel). Return ONLY a raw JSON array, no markdown, no code fences. Each object: {"name": "...", "description": "...", "image": "..."}`;

    return from(model.generateContent(prompt)).pipe(
      tap(result => {
        console.log('Raw LLM output:', result.response.text());
      }),
      map(result => {
        let content = result.response.text().trim();
        // Strip markdown code fences if present
        if (content.startsWith('```')) {
          content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        try {
          return JSON.parse(content);
        } catch (error) {
          console.error('Error parsing LLM output as JSON:', content, error);
          throw error;
        }
      })
    );
  }
}
