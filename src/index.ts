import { CloudOSClient, Drive, AWSProvider, File } from 'cloud-os';
import { Readable } from 'stream';

const cloudOSClient = new CloudOSClient();
const awsProvider = new AWSProvider('test');
const client = cloudOSClient.createObjectFileSystemClient(awsProvider);

async function main() {
    const drive = new Drive('test-drive-cloud-os');
    await client.createDriveAsync(drive);
    console.log('Created drive');

    console.log(await client.listDrivesAsync());

    const buffer = Buffer.from('Some content!', 'utf-8');
    const fileStream = Readable.from(buffer);
    const nestedFile = new File(
        '/a/very/long/path/to/this/file.txt',
        fileStream,
        buffer.byteLength
    );
    await client.writeFileAsync(drive, nestedFile);
    console.log('Wrote nested file');

    const shallowBuffer = Buffer.from('Some more content!', 'utf-8');
    const shallowFileStream = Readable.from(shallowBuffer);
    const shallowFile = new File('/foo.txt', shallowFileStream, shallowBuffer.byteLength);
    await client.writeFileAsync(drive, shallowFile);
    console.log('Wrote shallow file');

    const retrievedFile = await client.readFileAsync(drive, '/foo.txt');
    await new Promise((resolve, reject) => {
        retrievedFile.content
            .on('data', (buffer) => console.log(buffer.toString()))
            .on('error', reject)
            .on('close', resolve)
            .on('end', resolve);
    });

    await client.removeFileAsync(drive, retrievedFile);
    console.log('Removed shallow file');

    await client.makeDirectoryAsync(drive, '/empty');
    console.log('Created empty directory');
    const emptyDirectory = await client.listDirectoryAsync(drive, '/empty');
    console.log(emptyDirectory);

    const directory = await client.listDirectoryAsync(drive, '/');
    console.log(directory);

    await client.removeDirectoryAsync(drive, emptyDirectory);
    console.log('Removed empty directory');
    await client.removeDirectoryAsync(drive, directory);
    console.log('Removed root directory');

    await client.removeDriveAsync(drive);
    console.log('removed drive');
}

main();
