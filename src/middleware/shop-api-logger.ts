import { RequestHandler, Response } from 'express';

// How long in milliseconds between requests before
// we log a new split (`----------\n`).
const addSplitAfterMs = 1000;
let lastLoggedAt = 0;

/**
 * Middleware for use in performance investigations, which will log every
 * GraphQL request coming in to the Shop API.
 *
 * This is useful for debugging the shop app, which can tend to send too
 * many requests to the Vendure API if not correctly set up.
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  let payloadSize = 0;

  // Wrap res.end to capture payload size
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    if (chunk) {
      if (Buffer.isBuffer(chunk)) {
        payloadSize += chunk.length;
      } else if (typeof chunk === 'string') {
        payloadSize += Buffer.byteLength(chunk, encoding as BufferEncoding);
      }
    }
    const humanReadablePayloadSize =
      payloadSize > 1024
        ? `${(payloadSize / 1024).toFixed(2)} KB`
        : `${payloadSize} bytes`;
    const duration = Date.now() - start;
    const gqlDoc = req.body?.query?.substring(0, 50);
    if (gqlDoc) {
      if (Date.now() - lastLoggedAt > addSplitAfterMs) {
        // eslint-disable-next-line no-console
        console.log('----------\n');
      }
      lastLoggedAt = Date.now();
      const userAgent = req.headers['user-agent'] || 'unknown';
      const userAgentType = userAgent.includes('Middleware')
        ? 'middleware'
        : userAgent.includes('node')
          ? 'node'
          : 'browser';
      // eslint-disable-next-line no-console
      console.log(
        `${gqlDoc.split(' ').slice(0, 2).join(' ').padEnd(60)} | ${duration.toString().padStart(6)}ms | ${humanReadablePayloadSize.padStart(10)} | ${userAgentType.padStart(10)} | \x1b[90m${JSON.stringify(req.body.variables || {})}\x1b[0m`,
      );
    }
    return originalEnd.apply(
      // eslint-disable-next-line
      // @ts-ignore
      this,
      // eslint-disable-next-line
      arguments as any,
    );
  } as Response['end'];

  next();
};