const filePath = 'src/lib/database/database.ts';

import('./functions/logs');
import('./tables/channels');
import('./tables/settings');
import('./tables/seasons');
import('./tables/waitlist');
import('./functions/logs');
import('./tables/videos');

import { logSetup } from './functions/logs';

logSetup('All databases Initialized', '', filePath, '');
