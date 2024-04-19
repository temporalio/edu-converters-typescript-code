import express from 'express';
import cors from 'cors';
import * as proto from '@temporalio/proto';
// TODO Part A: Import EncryptionCodec from 'encryption-codec.ts'
// It is in the same directory.
import yargs from 'yargs/yargs';

type Payload = proto.temporal.api.common.v1.IPayload;

interface JSONPayload {
  metadata?: Record<string, string> | null;
  data?: string | null;
}

interface Body {
  payloads: JSONPayload[];
}

/**
 * Helper function to convert a valid proto JSON to a payload object.
 */
function fromJSON({ metadata, data }: JSONPayload): Payload {
  return {
    metadata:
      metadata &&
      Object.fromEntries(Object.entries(metadata).map(([k, v]): [string, Uint8Array] => [k, Buffer.from(v, 'base64')])),
    data: data ? Buffer.from(data, 'base64') : undefined,
  };
}

/**
 * Helper function to convert a payload object to a valid proto JSON.
 */
function toJSON({ metadata, data }: proto.temporal.api.common.v1.IPayload): JSONPayload {
  return {
    metadata:
      metadata &&
      Object.fromEntries(
        Object.entries(metadata).map(([k, v]): [string, string] => [k, Buffer.from(v).toString('base64')])
      ),
    data: data ? Buffer.from(data).toString('base64') : undefined,
  };
}

async function main({ port = 8888 }: any) {
  // TODO Part A: Instantiate a new variable named `codec`
  // which await calls the `create` method on the `EncryptionCodec`.
  // Pass in `test-key-id`.
  // This is an identifier for a specific encryption key used by the codec.
  const codec = '';

  const app = express();
  // TODO Part B: Use the cors middleware to allow for Headers 'x-namespace' and 'content-type'
  // Use CORS to allow traffic specficially to localhost:8233
  // An example of using cors middleware is below:
  // app.use(cors({origin: 'http://localhost:8888', allowedHeaders:['test1', 'test2']}))
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Codec server is running.');
  });

  app.post('/decode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      const encoded = raw.map(fromJSON);
      const decoded = await codec.decode(encoded);
      const payloads = decoded.map(toJSON);
      res.json({ payloads }).end();
    } catch (err) {
      console.log('ERR', err);
      res.status(500).end('Internal server error');
    }
  });

  app.post('/encode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      const decoded = raw.map(fromJSON);
      const encoded = await codec.encode(decoded);
      const payloads = encoded.map(toJSON);
      res.json({ payloads }).end();
    } catch (err) {
      console.error('Error in /encode', err);
      res.status(500).end('Internal server error');
    }
  });

  await new Promise<void>((resolve, reject) => {
    app.listen(port, resolve);
    app.on('error', reject);
  });

  console.log(`Codec server listening on port ${port}`);
}

const argv = yargs(process.argv.slice(2)).argv;

main(argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
