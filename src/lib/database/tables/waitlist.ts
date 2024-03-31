import Enmap from 'enmap';

export const waitlist = new Enmap<string, string>('waitlist', { dataDir: './data/database/' });
