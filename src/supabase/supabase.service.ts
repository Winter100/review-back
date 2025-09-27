import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CONFIG_KEY } from 'src/auth/constant/configKey';

@Injectable()
export class SupabaseService {
  private supabase: ReturnType<typeof createClient>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>(
      CONFIG_KEY.supabaseUrl,
    ) as string;
    const key = this.configService.get<string>(
      CONFIG_KEY.supabaseKey,
    ) as string;
    this.supabase = createClient(url, key);
  }

  getClient(): ReturnType<typeof createClient> {
    return this.supabase;
  }
}
