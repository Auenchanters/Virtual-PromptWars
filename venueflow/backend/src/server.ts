import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

app.listen(env.PORT, '0.0.0.0', () => {
    logger.info('VenueFlow server started', { host: '0.0.0.0', port: env.PORT });
});
