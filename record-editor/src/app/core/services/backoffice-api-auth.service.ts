import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import { CommonApiService } from './common-api.service';
import { backofficeApiUrl } from '../../shared/config';

@Injectable()
export class BackofficeApiAuthService extends CommonApiService {
  constructor(protected http: Http) {
    super(http);
  }

  refreshToken(refreshToken: string): Promise<{ access: string }> {
    return this.http
      .post(`${backofficeApiUrl}/token/refresh/`, { refresh: refreshToken })
      .map((res) => res.json())
      .toPromise();
  }
}
